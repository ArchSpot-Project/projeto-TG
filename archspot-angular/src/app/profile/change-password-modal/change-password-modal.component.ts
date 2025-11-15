import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { PasswordChangeDTO } from '../../core/models/user.model';
import { ToastService } from '../../core/services/toast.service';

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
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private userService: UserService, private authService: AuthService, private toast: ToastService) { }

  cancel() {
    this.resetFields();
    this.close.emit();
  }

  resetFields() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  changePassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.newPassword !== this.confirmPassword) {
      this.toast.showError('A nova senha e a confirmação não coincidem.');
      return;
    }

    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.toast.showError('Usuário não identificado.');
      return;
    }

    this.loading = true;

    const dto: PasswordChangeDTO = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.userService.changePassword(currentUser.id, dto).subscribe({
      next: () => {
        this.toast.showSuccess('Senha alterada com sucesso!');
        this.loading = false;
        this.cancel();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erro ao trocar senha.';
        this.loading = false;
      }
    });
  }
}