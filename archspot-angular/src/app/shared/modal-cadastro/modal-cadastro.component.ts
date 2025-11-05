import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../core/services/user.service';
import { Role, UserCreateDTO, UserDTO } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-modal-cadastro',
  templateUrl: './modal-cadastro.component.html',
  styleUrl: './modal-cadastro.component.css',
})

export class ModalCadastroComponent implements OnInit {

  constructor(
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private authService: AuthService
  ) { }

  @Input() isEditMode: boolean = false;
  @Input() userData: Partial<UserDTO> = {};

  cpf = '';
  name = '';
  phone = '';
  address = '';
  profession = '';
  email = '';
  userRole: Role = 'CUSTOMER';
  password = '';
  confirmPassword = '';
  passwordsDoNotMatch = false;

  preview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  ngOnInit() {
    if (this.isEditMode && this.userData) {
      this.cpf = this.userData.cpf || '';
      this.name = this.userData.name || '';
      this.phone = this.userData.phone || '';
      this.address = this.userData.address || '';
      this.profession = this.userData.profession || '';
      this.email = this.userData.email || '';
      this.userRole = this.userData.userRole || 'CUSTOMER';
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(form: NgForm) {
    this.passwordsDoNotMatch = this.password !== this.confirmPassword;
    if (form.invalid || this.passwordsDoNotMatch) {
      alert('Formulário inválido ou senhas distintas.');
      return;
    }

    const newUser: UserCreateDTO = {
      name: this.name,
      email: this.email,
      cpf: this.cpf,
      phone: this.phone,
      address: this.address,
      profession: this.profession,
      userRole: this.userRole,
      password: this.password
    };

    if (this.isEditMode && this.userData?.id) {
      this.userService.updateUser(this.userData.id, newUser).subscribe({
        next: (updatedUser) => {
          this.authService.setCurrentUser(updatedUser);
          alert('Perfil atualizado com sucesso!');
          this.activeModal.close();
          location.reload();
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || '';
          alert(msg.toLowerCase().includes('cpf') ? 'CPF inválido!' : 'Erro ao atualizar perfil.');
          console.error(err);
        }
      });
    } else {
      this.authService.register(newUser).subscribe({
        next: (response) => {
          alert('Usuário cadastrado com sucesso!');
          this.activeModal.close();
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || '';
          alert(msg.toLowerCase().includes('cpf') ? 'CPF inválido!' : 'Erro ao cadastrar usuário.');
          console.error(err);
        }
      });
    }
  }
}

