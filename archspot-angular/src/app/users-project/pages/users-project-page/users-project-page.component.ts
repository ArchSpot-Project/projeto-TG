import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserProjectService, UserProjectResponse, UserProjectRequest } from '../../../core/services/user-project.service';
import { SearchUserService, UserResponse } from '../../../core/services/search-user.service';
import { ProjectResponse, ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-users-project-page',
  templateUrl: './users-project-page.component.html'
})
export class UsersProjectPageComponent implements OnInit {
  projectId!: number;
  project?: ProjectResponse;
  users: UserProjectResponse[] = [];
  loading = false;

  // modal de cadastro
  showAddModal = false;
  searchTerm = '';
  searchResults: UserResponse[] = [];
  selectedUser: UserResponse | null = null;
  selectedRole = 'STAFF';
  roles = ['ADMIN', 'STAFF', 'CUSTOMER'];

  constructor(
    private route: ActivatedRoute,
    private userProjectService: UserProjectService,
    private projectService: ProjectService,
    private searchUserService: SearchUserService
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

  /** abrir modal */
  openAddUserModal(): void {
    this.showAddModal = true;
    this.searchTerm = '';
    this.searchResults = [];
    this.selectedUser = null;
    this.selectedRole = 'STAFF';
  }

  selectUser(user: UserResponse) {
    this.selectedUser = user;
    this.searchTerm = user.name; 
    this.searchResults = []; 
  }

  cancelAdd(): void {
    this.showAddModal = false;
  }

  searchUsers(term: string): void {
    this.searchTerm = term;

    if (!term.trim()) {
      this.searchResults = [];
      return;
    }

    this.searchUserService.search(term.trim()).subscribe({
      next: res => this.searchResults = res || [],
      error: err => { console.error('Erro ao buscar usuários', err); this.searchResults = []; }
    });
  }

  confirmAdd(): void {
    if (!this.selectedUser || !this.selectedRole) return;

    const payload: any = {
      userId: this.selectedUser.id,
      projectId: this.projectId,
      role: this.selectedRole
    };

    this.userProjectService.addUserToProject(payload).subscribe({
      next: () => {
        this.showAddModal = false;
        this.loadUsers();
        this.selectedUser = null;
        this.selectedRole = 'STAFF';
      },
      error: err => console.error('Erro ao adicionar usuário', err)
    });
  }
}
