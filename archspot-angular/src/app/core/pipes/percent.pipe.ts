import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percent'
})
export class PercentPipe implements PipeTransform {
  transform(value: number | null): string {
    if (value == null) return '-';
    return value + '%';
  }
}
