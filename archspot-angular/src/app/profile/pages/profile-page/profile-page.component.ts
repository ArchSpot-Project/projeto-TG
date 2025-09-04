import { Component, OnInit } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalCadastroComponent } from '../../../shared/modal-cadastro/modal-cadastro.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  user: User | null = null;

  constructor(private modalService: NgbModal, private authService: AuthService) { }

  ngOnInit(): void {
    this.user = this.authService.getUser(); // retorna o usuário logado
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
