import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InstallmentResponse, InstallmentService, PaymentMethod } from '../../core/services/installment.service';

@Component({
  selector: 'app-create-sequence-installments-modal',
  templateUrl: './create-sequence-installments-modal.component.html',
  styleUrls: ['./create-sequence-installments-modal.component.css']
})
export class CreateSequenceInstallmentsModalComponent {

  @Input() show = false;
  @Input() projectId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() installmentsCreated = new EventEmitter<InstallmentResponse[]>();

  totalAmount: number | null = null;
  numberOfInstallments: number | null = null;
  startDate: string | null = null;
  paymentMethod: PaymentMethod | null = null;
  sequenceDescription: string | null = null;

  paymentMethods: PaymentMethod[] = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO'];

  constructor(private installmentService: InstallmentService) { }

  cancel() {
    this.reset();
    this.close.emit();
  }

  private reset() {
    this.totalAmount = null;
    this.numberOfInstallments = null;
    this.startDate = null;
    this.paymentMethod = null;
    this.sequenceDescription = null;
  }

  onAmountChange(value: string) {
    const numeric = Number(value.replace(/\D/g, '')) / 100;
    this.totalAmount = numeric;
  }

  createSequence() {
    if (!this.totalAmount || !this.numberOfInstallments || !this.startDate || !this.paymentMethod || !this.sequenceDescription) {
      alert('Preencha todos os campos.');
      return;
    }

    // converte a string do input para Date usando UTC (para fornecer a data DD/MM/AAAA corretamente)
    const [year, month, day] = this.startDate.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, day));

    const amountPerInstallment = this.totalAmount / this.numberOfInstallments;
    const installments: any[] = [];

    for (let i = 0; i < this.numberOfInstallments; i++) {
      const date = new Date(start);
      date.setUTCMonth(date.getUTCMonth() + i);

      const estimatedPaymentDate = date.toISOString().slice(0, 10);

      installments.push({
        projectId: this.projectId,
        amount: amountPerInstallment,
        estimatedPaymentDate,
        paymentMethod: this.paymentMethod,
        description: `${this.sequenceDescription} - Parcela ${i + 1} de ${this.numberOfInstallments}`,
        paymentStatus: 'PENDING'
      });
    }

    const requests = installments.map(inst => this.installmentService.createInstallment(inst));

    Promise.all(requests.map(r => r.toPromise()))
      .then((createdInstallments: (InstallmentResponse | undefined)[]) => {
        const validInstallments = createdInstallments.filter((i): i is InstallmentResponse => !!i);
        this.installmentsCreated.emit(validInstallments);

        const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        alert(`Valor de R$${this.totalAmount?.toFixed(2)} dividido em ${this.numberOfInstallments} parcelas de R$${amountPerInstallment.toFixed(2)}, com pagamento inicial em ${formattedDate}`);

        location.reload();
        this.cancel();
      })
      .catch(err => {
        console.error('Erro ao criar sequência', err);
        alert('Erro ao criar sequência de parcelas.');
      });
  }
}
