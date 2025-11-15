import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { InstallmentService } from '../../core/services/installment.service';
import { InstallmentRequest, InstallmentResponse, PaymentMethod, PaymentStatus } from '../../core/models/payment.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-edit-installment-modal',
  templateUrl: './edit-installment-modal.component.html',
  styleUrls: ['./edit-installment-modal.component.css']
})
export class EditInstallmentModalComponent implements OnChanges {
  @Input() show: boolean = false;
  @Input() installment!: InstallmentResponse;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<InstallmentResponse | null>();

  amount: number | null = null;
  paymentMethod: PaymentMethod | null = null;
  paymentStatus: PaymentStatus | null = null;

  paymentMethods: PaymentMethod[] = [
    'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO', 'CHECK', 'CASH'
  ];

  paymentStatuses: PaymentStatus[] = [
    'PENDING', 'PAID', 'OVERDUE'
  ];

  cloned!: InstallmentResponse;

  constructor(private installmentService: InstallmentService, private toast: ToastService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['installment'] && this.installment) {
      this.cloned = { ...this.installment };
    }
  }

  onAmountChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    const value = input.value.replace(/\D/g, '');
    const numeric = Number(value) / 100;

    this.cloned.amount = numeric;

    input.value = numeric.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  cancel(): void {
    this.close.emit();
  }

  private parseLocalDate(dateStr: string): Date {
    const parts = dateStr.substring(0, 10).split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  updateInstallment(): void {
    const est = this.parseLocalDate(this.cloned.estimatedPaymentDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // não permite marcar hoje/futuras como atrasada
    if (this.cloned.paymentStatus === 'OVERDUE' && est >= today) {
      this.toast.showError('Parcela com previsão de pagamento igual ou futura não pode assumir o status "EM ATRASO".');
      return;
    }

    // não permite marcar como PENDENTE se a data prevista é anterior a hoje
    if (this.cloned.paymentStatus === 'PENDING' && est < today) {
      this.toast.showError('Parcela com data prevista anterior a hoje não pode ser marcada como PENDENTE.');
      return;
    }

    const dto: InstallmentRequest = {
      projectId: this.cloned.projectId,
      amount: this.cloned.amount,
      estimatedPaymentDate: this.cloned.estimatedPaymentDate,
      description: this.cloned.description || null,
      paymentStatus: this.cloned.paymentStatus,
      paymentMethod: this.cloned.paymentMethod || null,
      realPaymentDate: this.cloned.paymentStatus === 'PAID'
        ? this.cloned.realPaymentDate || this.cloned.estimatedPaymentDate
        : null
    };

    this.installmentService.updateInstallment(this.cloned.id, dto).subscribe({
      next: (res) => {
        this.toast.showSuccess('Parcela atualizada com sucesso!');
        this.updated.emit(res);
      },
      error: (err) => this.toast.showError('Erro ao atualizar parcela: ' + (err.error?.message || err.message))
    });
  }

}
