import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { InstallmentService, InstallmentResponse, InstallmentRequest, PaymentMethod } from '../../core/services/installment.service';

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
  paymentMethod: PaymentMethod | null = null;
  paymentMethods: PaymentMethod[] = [
    'PIX',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BOLETO',
    'CHECK',
    'CASH'
  ];

  cloned!: InstallmentResponse;

  constructor(private installmentService: InstallmentService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['installment'] && this.installment) {
      this.cloned = { ...this.installment };
    }
  }

  onAmountChange(value: string) {
    const numeric = Number(value.replace(/\D/g, '')) / 100;
    this.cloned.amount = numeric;
  }

  cancel(): void {
    this.close.emit();
  }

  updateInstallment(): void {
    const dto: InstallmentRequest = {
      projectId: this.cloned.projectId,
      amount: this.cloned.amount,
      estimatedPaymentDate: this.cloned.estimatedPaymentDate,
      description: this.cloned.description || null,
      paymentStatus: this.cloned.paymentStatus,
      paymentMethod: this.cloned.paymentMethod || null,
      realPaymentDate: this.cloned.paymentStatus === 'PAID' ? this.cloned.realPaymentDate || this.cloned.estimatedPaymentDate : null
    };
    this.installmentService.updateInstallment(this.cloned.id, dto).subscribe({
      next: (res) => {
        alert('Parcela atualizada com sucesso!');
        this.updated.emit(res);
      },
      error: (err) => alert('Erro ao atualizar parcela: ' + (err.error?.message || err.message))
    });
  }

  deleteInstallment(): void {
    if (!confirm('Deseja realmente excluir esta parcela?')) return;

    this.installmentService.deleteInstallment(this.cloned.id).subscribe({
      next: () => {
        alert('Parcela excluída com sucesso!');
        this.updated.emit(null);
        this.cancel(); 
      },
      error: (err) => {
        console.error('Erro ao excluir parcela', err);
        alert('Erro ao excluir a parcela.');
      }
    });
  }

}
