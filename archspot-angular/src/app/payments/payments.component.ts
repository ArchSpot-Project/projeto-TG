import { Component, OnInit } from '@angular/core';
import { InstallmentService, InstallmentResponse, PaymentMethod, PaymentStatus } from '../core/services/installment.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectService, ProjectResponse } from '../core/services/project.service';
import { AuthService } from '../core/services/auth.service';
import { UserProjectService } from '../core/services/user-project.service';

interface SelectableInstallment extends InstallmentResponse {
  selected?: boolean;
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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return console.error('ID do projeto não fornecido.');
    this.projectId = +idParam;

    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;
    this.userRole = currentUser?.userRole || null;

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

  cancelSelectedInstallments() {
    if (!confirm('Deseja realmente cancelar as parcelas selecionadas?')) return;

    this.selectedInstallments.forEach(inst => {
      this.installmentService.cancelInstallment(inst.id).subscribe({
        next: updated => {
          const idx = this.installments.findIndex(i => i.id === updated.id);
          if (idx >= 0) this.installments[idx] = updated;
        },
        error: err => console.error('Erro ao cancelar parcela', err)
      });
    });

    alert('Parcelas canceladas com sucesso!');
    this.clearSelection();
  }

  deleteSelectedInstallments() {
    if (!confirm('Deseja realmente excluir as parcelas selecionadas?')) return;

    this.selectedInstallments.forEach(inst => {
      this.installmentService.deleteInstallment(inst.id).subscribe({
        next: () => {
          this.installments = this.installments.filter(i => i.id !== inst.id);
        },
        error: err => console.error('Erro ao excluir parcela', err)
      });
    });

    alert('Parcelas excluídas com sucesso!');
    this.clearSelection();
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

  get isCustomerInProject(): boolean {
    if (!this.userId) return true;
    const user = this.projectUsers.find(u => u.userId === this.userId);
    return user?.role === 'CUSTOMER';
  }

  loadProject(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: res => this.project = res,
      error: err => console.error(err)
    });
  }

  loadInstallments(): void {
    this.installmentService.findAll().subscribe({
      next: list => {
        this.installments = list
          .filter(i => i.projectId === this.projectId)
          .map(i => ({ ...i, selected: false })) // adiciona selected
          .sort((a, b) => (a.estimatedPaymentDate > b.estimatedPaymentDate ? 1 : -1));
      },
      error: err => console.error('Erro ao carregar parcelas', err)
    });
  }

  handleInstallmentsCreated(newInstallments: InstallmentResponse[]) {
    const selectable = newInstallments.map(i => ({ ...i, selected: false }));
    this.installments.push(...selectable);
    this.installments.sort((a, b) => (a.estimatedPaymentDate > b.estimatedPaymentDate ? 1 : -1));
  }

  openCreateInstallmentModal(): void {
    this.showCreateModal = true;
  }

  openCreateSequenceModal(): void {
    this.showCreateSequenceModal = true;
  }

  onInstallmentCreated(newInstallment: InstallmentResponse): void {
    this.installments.push({ ...newInstallment, selected: false });
    this.installments.sort((a, b) => (a.estimatedPaymentDate > b.estimatedPaymentDate ? 1 : -1));
  }

  openEditInstallmentModal(installment: SelectableInstallment, index: number): void {
    this.selectedInstallment = { ...installment };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedInstallment = null;
  }

  onInstallmentUpdated(updated: InstallmentResponse | null): void {
    if (!updated) {
      if (this.selectedInstallment) {
        this.installments = this.installments.filter(i => i.id !== this.selectedInstallment?.id);
      }
    } else {
      const idx = this.installments.findIndex(i => i.id === updated.id);
      if (idx >= 0) this.installments[idx] = { ...updated, selected: false };
    }
    this.closeEditModal();
  }

  deleteInstallment(id: number): void {
    if (!confirm('Deseja realmente excluir esta parcela?')) return;
    this.installmentService.deleteInstallment(id).subscribe({
      next: () => {
        alert('Parcela excluída com sucesso!');
        this.installments = this.installments.filter(i => i.id !== id);
      },
      error: (err) => alert('Erro ao excluir parcela: ' + (err.error?.message || err.message))
    });
  }

  payInstallment(installment: SelectableInstallment): void {
    if (!installment.paymentMethod) {
      alert('Esta parcela não possui método de pagamento definido.');
      return;
    }

    this.installmentService.payInstallment(installment.id, installment.paymentMethod).subscribe({
      next: updated => {
        const idx = this.installments.findIndex(i => i.id === updated.id);
        if (idx >= 0) this.installments[idx] = { ...updated, selected: false };
        else this.installments.push({ ...updated, selected: false });

        alert('Parcela paga.');
      },
      error: err => {
        console.error('Erro ao pagar parcela', err);
        alert('Erro ao marcar parcela como paga.');
      }
    });
  }

  cancelInstallment(installment: SelectableInstallment): void {
    if (!confirm('Deseja realmente cancelar esta parcela?')) return;

    this.installmentService.cancelInstallment(installment.id).subscribe({
      next: updated => {
        const idx = this.installments.findIndex(i => i.id === updated.id);
        if (idx >= 0) this.installments[idx] = { ...updated, selected: false };
        alert('Parcela cancelada com sucesso!');
      },
      error: err => {
        console.error('Erro ao cancelar parcela', err);
        alert('Erro ao cancelar a parcela.');
      }
    });
  }
}
