import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleTranslate'
})
export class RoleTranslatePipe implements PipeTransform {
  transform(value?: string): string {
    if (!value) return '—';
    switch (value.toUpperCase()) {
      case 'ADMIN':
        return 'Gerente';
      case 'STAFF':
        return 'Colaborador';
      case 'CUSTOMER':
        return 'Cliente';
      default:
        return value;
    }
  }
}
