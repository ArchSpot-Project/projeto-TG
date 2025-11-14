import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InstallmentService } from '../../core/services/installment.service';
import { InstallmentResponse, PaymentMethod } from '../../core/models/payment.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-create-installment-modal',
  templateUrl: './create-installment-modal.component.html',
  styleUrls: ['./create-installment-modal.component.css']
})
export class CreateInstallmentModalComponent {
  @Input() show: boolean = false;
  @Input() projectId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() installmentCreated = new EventEmitter<InstallmentResponse>();

  amount: number | null = null;
  description: string = '';
  paymentMethod: PaymentMethod | null = null;
  estimatedPaymentDate: string = '';

  // lista de métodos de pagamento disponíveis
  paymentMethods: PaymentMethod[] = [
    'PIX',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BOLETO',
    'CHECK',
    'CASH'
  ];

  constructor(
    private installmentService: InstallmentService,
    private toast: ToastService
  ) { }

  onAmountChange(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    const value = input.value;

    const onlyNumbers = value.replace(/\D/g, '');
    const numeric = Number(onlyNumbers) / 100;
    this.amount = numeric;

    input.value = numeric.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  cancel(): void {
    this.resetForm();
    this.close.emit();
  }

  createInstallment(): void {
    if (!this.amount || !this.estimatedPaymentDate) {
      this.toast.showError('Preencha todos os campos obrigatórios!');
      return;
    }

    this.installmentService.createInstallment({
      projectId: this.projectId,
      amount: this.amount,
      estimatedPaymentDate: this.estimatedPaymentDate,
      description: this.description || null,
      paymentMethod: this.paymentMethod || null,
      paymentStatus: 'PENDING'
    }).subscribe({
      next: (created) => {
        this.installmentCreated.emit(created);
        this.cancel();
        this.toast.showSuccess('Parcela criada com sucesso!');
      },
      error: (err) => this.toast.showError('Erro ao criar parcela: ' + (err.error?.message || err.message))
    });
  }

  private resetForm(): void {
    this.amount = null;
    this.description = '';
    this.estimatedPaymentDate = '';
    this.paymentMethod = null;
  }
}
