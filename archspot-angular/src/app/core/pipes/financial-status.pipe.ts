import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'financialStatus'
})
export class FinancialStatusPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'CANCELADO':
        return 'Cancelado';

      case 'SEM_PARCELAS':
        return 'Sem parcelas cadastradas';

      case 'QUITADO':
        return 'Quitado';

      case 'EM_PLANEJAMENTO':
        return 'Em planejamento';

      case 'EM_ABERTO':
        return 'Em aberto';

      case 'PENDENTE':
        return 'Pendente';

      default:
        return value; // fallback seguro
    }
  }
}
