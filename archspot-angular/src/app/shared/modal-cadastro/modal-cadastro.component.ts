import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../core/services/user.service';
import { Role, UserCreateDTO, UserDTO, UserUpdateDTO } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-modal-cadastro',
  templateUrl: './modal-cadastro.component.html',
  styleUrl: './modal-cadastro.component.css',
})
export class ModalCadastroComponent implements OnInit {

  @Input() isEditMode: boolean = false;
  @Input() userData: Partial<UserDTO> = {};

  cpf = '';
  name = '';
  phone = '';
  address = '';
  profession = '';
  email = '';
  password = '';
  fileUrl = '';
  confirmPassword = '';
  passwordsDoNotMatch = false;

  preview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private authService: AuthService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    if (this.isEditMode && this.userData) {
      this.cpf = this.userData.cpf || '';
      this.name = this.userData.name || '';
      this.phone = this.userData.phone || '';
      this.address = this.userData.address || '';
      this.profession = this.userData.profession || '';
      this.email = this.userData.email || '';
      this.fileUrl = this.userData.fileUrl || '';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.preview = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  onSubmit(form: NgForm) {
    // se EDIÇÃO
    if (this.isEditMode) {
      if (!this.password) {
        this.toast.showWarning('Digite sua senha para salvar alterações');
        return;
      }

      const updatedUser: UserUpdateDTO = {
        cpf: this.cpf,
        name: this.name,
        phone: this.phone,
        address: this.address,
        profession: this.profession,
        email: this.email,
        password: this.password,
        fileUrl: this.fileUrl
      };

      this.userService.updateUser(this.userData.id!, updatedUser, this.selectedFile!).subscribe({
        next: updated => {
          this.authService.setCurrentUser(updated);
          this.activeModal.close();
          this.toast.showSuccess('Perfil atualizado com sucesso!');
          setTimeout(() => location.reload(), 500);
        },
        error: err => this.toast.showError('Senha incorreta ou dados inválidos.')
      });

      return;
    }

    // --- se CADASTRO ---
    if (form.invalid) {
      this.toast.showWarning('Formulário inválido.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.passwordsDoNotMatch = true;
      this.toast.showWarning('A confirmação de senha não confere.');
      return;
    } else {
      this.passwordsDoNotMatch = false;
    }

    const newUser: UserCreateDTO = {
      cpf: this.cpf,
      name: this.name,
      phone: this.phone,
      address: this.address,
      profession: this.profession,
      email: this.email,
      password: this.password,
      fileUrl: this.fileUrl
    };

    this.authService.register(newUser, this.selectedFile!).subscribe({
      next: () => {
        this.toast.showSuccess('Usuário cadastrado com sucesso!');
        this.activeModal.close();
      },
      error: err => {
        const backendMessage =
          err?.error?.message ||
          err?.error ||
          err?.message ||
          'Erro ao cadastrar usuário.';

        // verifica se o backend já mandou mensagem clara
        if (backendMessage.toLowerCase().includes('email')) {
          this.toast.showError(backendMessage);
        } else if (backendMessage.toLowerCase().includes('cpf')) {
          this.toast.showError('CPF inválido!');
        } else {
          this.toast.showError(backendMessage);
        }

        console.error('Erro no cadastro:', err);
      }
    });
  }
}
