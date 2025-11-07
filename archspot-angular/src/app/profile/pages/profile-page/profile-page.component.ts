import { Component, OnInit } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalCadastroComponent } from '../../../shared/modal-cadastro/modal-cadastro.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  user: User | null = null;

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();

    if (currentUser && currentUser.id) {
      this.userService.getUserById(currentUser.id).subscribe({
        next: (fullUser) => {
          this.user = fullUser;
          this.authService.setCurrentUser(fullUser);
        },
        error: (err) => console.error('Erro ao carregar perfil completo:', err)
      });
    } else {
      console.warn('Nenhum usuário logado encontrado');
    }
  }

  openEditModal(): void {
    const modalRef = this.modalService.open(ModalCadastroComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.isEditMode = true;
    modalRef.componentInstance.userData = this.user;
  }
}
