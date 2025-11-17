import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InstallmentService } from '../../core/services/installment.service';
import { InstallmentResponse, PaymentMethod, PaymentStatus } from '../../core/models/payment.model';
import { ToastService } from '../../core/services/toast.service';

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

  totalAmount: number = 0;
  displayTotalAmount: string = '';

  numberOfInstallments: number | null = null;
  startDate: string | null = null;
  paymentMethod: PaymentMethod | null = null;
  sequenceDescription: string | null = null;

  paymentMethods: PaymentMethod[] = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO', 'CHECK', 'CASH'];

  constructor(
    private installmentService: InstallmentService,
    private toast: ToastService
  ) { }

  cancel() {
    this.reset();
    this.close.emit();
  }

  private reset() {
    this.totalAmount = 0;
    this.displayTotalAmount = '';
    this.numberOfInstallments = null;
    this.startDate = null;
    this.paymentMethod = null;
    this.sequenceDescription = null;
  }

  // --- CORREÇÃO DO INPUT ---
  onTotalAmountInput(event: Event) {
    const input = event.target as HTMLInputElement;

    // Permite apenas números e vírgula/ponto, mas impede letras
    input.value = input.value.replace(/[^0-9.,]/g, '');

    // Continuação da sua lógica
    const raw = input.value;

    // Extrai somente números
    const digits = raw.replace(/\D/g, '');

    if (digits === '') {
      this.totalAmount = 0;
      this.displayTotalAmount = '';
      return;
    }

    // número real dividido por 100
    const numeric = Number(digits) / 100;

    this.totalAmount = numeric;

    // formata para BR
    this.displayTotalAmount = numeric.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }


  createSequence() {
    if (!this.totalAmount || !this.numberOfInstallments || !this.startDate ||
      !this.paymentMethod || !this.sequenceDescription) {
      this.toast.showError('Preencha todos os campos.');
      return;
    }

    const [year, month, day] = this.startDate.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, day));

    const amountPerInstallment = this.totalAmount / this.numberOfInstallments;

    const installments = [];

    for (let i = 0; i < this.numberOfInstallments; i++) {
      const date = new Date(start);
      date.setUTCMonth(date.getUTCMonth() + i);

      installments.push({
        projectId: this.projectId,
        amount: amountPerInstallment,
        estimatedPaymentDate: date.toISOString().slice(0, 10),
        paymentMethod: this.paymentMethod,
        description: `${this.sequenceDescription} - Parcela ${i + 1} de ${this.numberOfInstallments}`,
        paymentStatus: 'PENDING' as PaymentStatus
      });
    }

    const requests = installments.map(inst => this.installmentService.createInstallment(inst));

    Promise.all(requests.map(r => r.toPromise()))
      .then(results => {
        const valid = results.filter((i): i is InstallmentResponse => !!i);
        this.installmentsCreated.emit(valid);

        alert(`Criadas ${this.numberOfInstallments} parcelas.`);

        location.reload();
        this.cancel();
      })
      .catch(err => {
        console.error(err);
        this.toast.showError('Erro ao criar sequência de parcelas.');
      });
  }
}
