import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { UserResponse } from '../../core/services/search-user.service';
import { ProjectService, CreateProjectRequest, ProjectResponse } from '../../core/services/project.service';
import { forkJoin } from 'rxjs';

interface ProjectUser {
  userId: number;
  userName: string;
  role: string;
}

@Component({
  selector: 'app-create-project-modal',
  templateUrl: './create-project-modal.component.html',
  styleUrls: ['./create-project-modal.component.css']
})
export class CreateProjectModalComponent implements OnInit, OnChanges {
  @Input() show = false;
  @Input() currentUserId!: number;
  @Input() currentUserName!: string;
  @Output() close = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<void>();

  projectName = '';
  projectDescription = '';
  estimatedStartDate = '';
  estimatedEndDate = '';
  status = 'PLANNED';

  users: ProjectUser[] = [];
  showAddModal = false;
  loading = false;
  roles = ['ADMIN', 'STAFF', 'CUSTOMER'];

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
  if (this.currentUserId != null && this.currentUserName != null) {
    this.users = [{
      userId: this.currentUserId,
      userName: this.currentUserName,
      role: 'ADMIN'
    }];
  } 
}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.show && this.currentUserId && this.currentUserName) {
      const exists = this.users.some(u => u.userId === this.currentUserId);
      if (!exists) {
        this.users = [{
          userId: this.currentUserId,
          userName: this.currentUserName,
          role: 'ADMIN'
        }, ...this.users]; 
      }
    }
  }

  cancel(): void {
    this.show = false;
    this.close.emit();
  }

  openAddUserModal(): void { this.showAddModal = true; }
  cancelAdd(): void { this.showAddModal = false; }

  handleAddUser(event: { user: UserResponse; role: string }): void {
    if (this.users.some(u => u.userId === event.user.id)) {
      alert('Este usuário já foi adicionado.');
      return;
    }
    this.users.push({ userId: event.user.id, userName: event.user.name, role: event.role });
    this.showAddModal = false;
  }

  removeUser(user: ProjectUser): void {
    if (user.role === 'ADMIN' && user.userId === this.currentUserId) {
      alert('O usuário administrador do projeto não pode ser removido.');
      return;
    }
    this.users = this.users.filter(u => u.userId !== user.userId);
  }

  createProject(): void {
    if (!this.projectName || !this.estimatedStartDate || !this.estimatedEndDate) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    this.loading = true;

    const payload: CreateProjectRequest = {
      name: this.projectName,
      description: this.projectDescription,
      estimatedStartDate: this.estimatedStartDate,
      estimatedEndDate: this.estimatedEndDate,
      status: this.status
    };

    this.projectService.createProject(payload).subscribe({
      next: (project: ProjectResponse) => {
        const projectId = project.id;

        const allUsers = this.users.some(u => u.userId === this.currentUserId)
          ? this.users
          : [{ userId: this.currentUserId, userName: this.currentUserName, role: 'ADMIN' }, ...this.users];

        const requests = allUsers.map(u =>
          this.projectService.assignUserToProject(projectId, u.userId, u.role)
        );

        forkJoin(requests).subscribe({
          next: () => {
            this.projectCreated.emit();
            this.loading = false;
            this.cancel();
            alert(`Projeto ${project.name} criado com sucesso`);
          },
          error: err => {
            console.error('Erro ao associar usuários', err);
            this.projectCreated.emit();
            this.loading = false;
            this.cancel();
          }
        });
      },
      error: err => {
        console.error('Erro ao criar projeto', err);
        alert('Erro ao criar projeto.');
        this.loading = false;
      }
    });
  }
}
