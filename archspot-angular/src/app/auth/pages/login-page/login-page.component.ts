import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { UserCredentials } from '../../../core/models/user.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalCadastroComponent } from '../../../shared/modal-cadastro/modal-cadastro.component';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  email: string = '';
  password: string = '';
  error: boolean = false;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private modalService: NgbModal
  ) { }

  login() {
    const credentials: UserCredentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        const user = response.user;

        this.userService.getUserById(user.id).subscribe({
          next: (fullUser) => {
            this.authService.setCurrentUser(fullUser);
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('Erro ao buscar usuário completo:', err);
            this.authService.setCurrentUser(user);
            this.router.navigate(['/home']);
          }
        });
      },
      error: () => this.error = true
    });
  }

  openRegisterModal() {
    this.modalService.open(ModalCadastroComponent, { size: 'lg' });
  }
}
