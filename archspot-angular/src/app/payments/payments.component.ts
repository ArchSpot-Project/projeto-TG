import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { UserProjectService } from '../core/services/user-project.service';
import { InstallmentResponse, PaymentMethod, PaymentStatus } from '../core/models/payment.model';
import { ProjectResponse } from '../core/models/project.model';
import { InstallmentService } from '../core/services/installment.service';
import { ProjectService } from '../core/services/project.service';
import { ToastService } from '../core/services/toast.service';

interface SelectableInstallment extends InstallmentResponse {
  selected?: boolean;
  paymentStatus: PaymentStatus;
}

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  projectId!: number;
  project?: ProjectResponse;
  installments: SelectableInstallment[] = [];
  paymentMethod: PaymentMethod | null = null;
  showCreateModal = false;
  showEditModal = false;
  showCreateSequenceModal = false;
  selectedInstallment: SelectableInstallment | null = null;
  projectUsers: any[] = [];
  userId: number | null = null;
  userRole: string | null = null;
  selectedInstallments: SelectableInstallment[] = [];

  constructor(
    private installmentService: InstallmentService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private userProjectService: UserProjectService,
    private authService: AuthService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return console.error('ID do projeto não fornecido.');
    this.projectId = +idParam;

    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;

    this.loadProject();
    this.loadInstallments();
    this.loadProjectUsers();
  }

  toggleSelection(installment: SelectableInstallment) {
    if (installment.selected) {
      this.selectedInstallments.push(installment);
    } else {
      this.selectedInstallments = this.selectedInstallments.filter(i => i.id !== installment.id);
    }
  }

  clearSelection() {
    this.selectedInstallments.forEach(i => i.selected = false);
    this.selectedInstallments = [];
  }

  loadProjectUsers(): void {
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: users => this.projectUsers = users,
      error: err => console.error('Erro ao carregar usuários do projeto', err)
    });
  }

  get isAssociateInProject(): boolean {
    if (!this.userId) return true;
    const user = this.projectUsers.find(u => u.userId === this.userId);
    return user?.role === 'CUSTOMER' || user?.role === 'EXTERNAL_COLLABORATOR';
  }

  loadProject(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: res => this.project = res,
      error: err => console.error(err)
    });
  }

  private isOverdue(estimatedDate: string | Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = estimatedDate.toString().split('T')[0].split('-').map(Number);
    const est = new Date(year, month - 1, day);

    return est < today;
  }

  private recalculateProjectTotal(): void {
    if (!this.project) return;
    this.project.totalValue = this.installments
      .reduce((sum, inst) => sum + inst.amount, 0);
  }

  loadInstallments(): void {
    this.installmentService.findAll().subscribe({
      next: list => {
        this.installments = list
          .filter(i => i.projectId === this.projectId)
          .map(i => {
            let paymentStatus: PaymentStatus = 'PENDING';
            if (i.realPaymentDate) {
              paymentStatus = 'PAID';
            } else if (this.isOverdue(i.estimatedPaymentDate)) {
              paymentStatus = 'OVERDUE';
            }
            return { ...i, selected: false, paymentStatus };
          })
          .sort((a, b) => {
            const aDate = new Date(a.estimatedPaymentDate).getTime();
            const bDate = new Date(b.estimatedPaymentDate).getTime();
            return aDate - bDate;
          });

        this.recalculateProjectTotal();
      },
      error: err => console.error('Erro ao carregar parcelas', err)
    });
  }

  handleInstallmentsCreated(newInstallments: InstallmentResponse[]) {
    this.loadInstallments();
  }

  openCreateInstallmentModal(): void {
    this.showCreateModal = true;
  }

  openCreateSequenceModal(): void {
    this.showCreateSequenceModal = true;
  }

  onInstallmentCreated(newInstallment: InstallmentResponse): void {
    this.loadInstallments();
  }

  openEditInstallmentModal(installment: SelectableInstallment): void {
    this.selectedInstallment = { ...installment };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedInstallment = null;
  }

  onInstallmentUpdated(updated: InstallmentResponse | null): void {
    if (!updated) {
      if (this.selectedInstallment !== null && this.selectedInstallment.id != null) {
        this.installments = this.installments.filter(i => i.id !== this.selectedInstallment!.id);
      }

    } else {
      const idx = this.installments.findIndex(i => i.id === updated.id);

      const installmentWithStatus: SelectableInstallment = {
        ...updated,
        selected: false,
        paymentStatus: updated.realPaymentDate ? 'PAID'
          : this.isOverdue(updated.estimatedPaymentDate) ? 'OVERDUE'
            : 'PENDING'
      };

      if (idx >= 0) this.installments[idx] = installmentWithStatus;
      else this.installments.push(installmentWithStatus);

      this.installments.sort((a, b) =>
        new Date(a.estimatedPaymentDate).getTime() - new Date(b.estimatedPaymentDate).getTime()
      );
    }
    this.closeEditModal();
    this.recalculateProjectTotal();
  }

  deleteSelectedInstallments() {
    if (!confirm('Deseja realmente excluir as parcelas selecionadas?'))
      return; this.selectedInstallments.forEach(inst => {
        this.installmentService.deleteInstallment(inst.id).subscribe({
          next: () => { this.installments = this.installments.filter(i => i.id !== inst.id); },
          error: err => console.error('Erro ao excluir parcela', err)
        });
      });
    this.toast.showSuccess('Parcelas excluídas com sucesso!'); this.clearSelection(); location.reload();
    this.recalculateProjectTotal();
  }

  deleteInstallment(id: number): void {
    if (!confirm('Deseja realmente excluir esta parcela?')) return;
    this.installmentService.deleteInstallment(id).subscribe({
      next: () => {
        this.toast.showSuccess('Parcela excluída com sucesso!');
        this.installments = this.installments.filter(i => i.id !== id);
        this.recalculateProjectTotal();
      },
      error: (err) => this.toast.showError('Erro ao excluir parcela: ' + (err.error?.message || err.message))
    });
  }

  payInstallment(installment: SelectableInstallment): void {
    if (!installment.paymentMethod) {
      this.toast.showError('Esta parcela não possui método de pagamento definido.');
      return;
    }

    const confirmed = window.confirm('Deseja marcar a parcela como PAGA?');
    if (!confirmed) return;

    this.installmentService.payInstallment(installment.id, installment.paymentMethod).subscribe({
      next: updated => {
        const installmentWithStatus: SelectableInstallment = { ...updated, selected: false, paymentStatus: 'PAID' };
        const idx = this.installments.findIndex(i => i.id === updated.id);
        if (idx >= 0) this.installments[idx] = installmentWithStatus;
        else this.installments.push(installmentWithStatus);
        this.toast.showSuccess('Parcela paga com sucesso.');
      },
      error: err => {
        console.error('Erro ao pagar parcela', err);
        this.toast.showError('Erro ao marcar parcela como paga.');
      }
    });
  }
}
