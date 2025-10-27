import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paymentMethod'
})
export class PaymentMethodPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'PIX':
        return 'Pix';
      case 'CREDIT_CARD':
        return 'Cartão de Crédito';
      case 'DEBIT_CARD':
        return 'Cartão de Débito';
      case 'BOLETO':
        return 'Boleto Bancário';
      case 'CHECK':
        return 'Cheque';
      case 'CASH':
        return 'Dinheiro em espécie';
      default:
        return value;
    }
  }
}
