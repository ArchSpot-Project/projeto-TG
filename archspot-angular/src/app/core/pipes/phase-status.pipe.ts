import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phaseStatus'
})
export class PhaseStatusPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'NOT_STARTED':
        return 'Não iniciada';
      case 'IN_PROGRESS':
        return 'Em andamento';
      case 'COMPLETED':
        return 'Finalizada';
      case 'OVERDUE':
        return 'Atrasada';
      default:
        return value;
    }
  }
}
