import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserProjectService, UserProjectResponse } from '../../../core/services/user-project.service';
import { ProjectService, ProjectResponse } from '../../../core/services/project.service';
import { UserResponse } from '../../../core/services/search-user.service';

@Component({
  selector: 'app-users-project-page',
  templateUrl: './users-project-page.component.html'
})
export class UsersProjectPageComponent implements OnInit {
  projectId!: number;
  project?: ProjectResponse;
  users: UserProjectResponse[] = [];
  loading = false;

  showAddModal = false;
  roles = ['ADMIN', 'STAFF', 'CUSTOMER'];

  constructor(
    private route: ActivatedRoute,
    private userProjectService: UserProjectService,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.projectId = +idParam;
      this.loadProject();
      this.loadUsers();
    } else {
      console.error('ID do projeto não fornecido na rota.');
    }
  }

  loadProject(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: project => this.project = project,
      error: err => console.error('Erro ao carregar projeto', err)
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: res => { this.users = res; this.loading = false; },
      error: () => { this.loading = false; console.error('Erro ao carregar usuários'); }
    });
  }

  removeUser(user: UserProjectResponse): void {
    if (confirm(`Deseja desassociar ${user.userName} do projeto ${this.project?.name}?`)) {
      this.userProjectService.removeUserFromProject(user.projectId, user.userId).subscribe({
        next: () => this.loadUsers(),
        error: err => console.error('Erro ao remover usuário', err)
      });
    }
  }

  openAddUserModal(): void {
    this.showAddModal = true;
  }

  cancelAdd(): void {
    this.showAddModal = false;
  }

  handleAddUser(event: { user: UserResponse; role: string }): void {
    const payload = {
      userId: event.user.id,
      projectId: this.projectId,
      role: event.role
    };

    this.userProjectService.addUserToProject(payload).subscribe({
      next: () => {
        this.loadUsers();
        this.showAddModal = false;
      },
      error: err => console.error('Erro ao adicionar usuário', err)
    });
  }
}
