import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];

  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  clear() {
    this.toasts.splice(0, this.toasts.length);
  }

  showSuccess(message: string) {
    this.show(message, { classname: 'bg-success text-light', delay: 3000 });
  }

  showError(message: string) {
    this.show(message, { classname: 'bg-danger text-light', delay: 4000 });
  }

  showWarning(message: string) {
    this.show(message, { classname: 'bg-warning text-dark', delay: 4000 });
  }

  showInfo(message: string) {
    this.show(message, { classname: 'bg-info text-light', delay: 3000 });
  }
}
