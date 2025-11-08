import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ModalCadastroComponent } from '../../shared/modal-cadastro/modal-cadastro.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: false
})
export class NavbarComponent {

  constructor(public authService: AuthService, private router: Router, private modalService: NgbModal) { }

  goToLogin() {
    this.router.navigate(['/login']);
  }
  
  goToPlans(planType?: number) {
    // TODO: Rotas de Tipos de Planos genérico, implementar um dia...
    if (planType !== undefined) {
      this.router.navigate(['/plans', planType]);
    } else {
      this.router.navigate(['/plans']);
    }
  }

  goToHome() {
    if(this.isLoggedIn()) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/']);
    }
    
  }

  goToProjects() {
    this.router.navigate(['/projects']);
  }

  openRegisterModal() {
      this.modalService.open(ModalCadastroComponent , { size: 'lg' });
  }

  goToUserAccount() {
    this.router.navigate(['/profile']);
  }

  get user() {
    return this.authService.getUser();
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

}
