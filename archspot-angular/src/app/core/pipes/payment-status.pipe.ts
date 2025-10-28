import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paymentStatus'
})

export class PaymentStatusPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'PENDING':
        return 'Pendente';
      case 'PAID':
        return 'Paga';
      case 'OVERDUE':
        return 'Em atraso';
      case 'CANCELED':
        return 'Cancelada';
      default:
        return value;
    }
  }
}
