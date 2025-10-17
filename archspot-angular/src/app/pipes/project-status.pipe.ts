import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusTranslate'
})
export class StatusTranslatePipe implements PipeTransform {
  transform(value?: string): string {
    if (!value) return '—';
    switch (value.toUpperCase()) {
      case 'IN_PROGRESS':
        return 'Em progresso';
      case 'CANCELED':
        return 'Cancelado';
      case 'COMPLETED':
        return 'Completo';
      case 'PLANNED':
        return 'Em planejamento';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return value;
    }
  }
}
