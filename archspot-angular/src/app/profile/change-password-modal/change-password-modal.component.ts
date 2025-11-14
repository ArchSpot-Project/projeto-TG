import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.css']
})
export class ChangePasswordModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  cancel() {
    this.close.emit();
  }
}
