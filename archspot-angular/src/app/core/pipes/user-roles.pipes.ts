import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleTranslate'
})
export class RoleTranslatePipe implements PipeTransform {
  transform(value?: string): string {
    if (!value) return '—';
    switch (value.toUpperCase()) {
      case 'ADMIN':
        return 'Administrador';
      case 'STAFF':
        return 'Gerente';
      case 'CUSTOMER':
        return 'Cliente';
      default:
        return value;
    }
  }
}
