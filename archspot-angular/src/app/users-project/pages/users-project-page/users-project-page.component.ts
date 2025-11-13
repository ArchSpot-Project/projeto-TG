import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { UserResponse } from '../../../core/services/search-user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserProjectResponse } from '../../../core/models/user-project.model';
import { ProjectResponse } from '../../../core/models/project.model';
import { UserProjectService } from '../../../core/services/user-project.service';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-users-project-page',
  templateUrl: './users-project-page.component.html'
})
export class UsersProjectPageComponent implements OnInit {
  projectId!: number;
  isAdmInProject = false;
  project?: ProjectResponse;
  users: (UserProjectResponse & { roleBeforeChange?: string })[] = [];
  loading = false;

  showAddModal = false;
  showTransferModal = false;

  // roles para mudar no combo box
  roles = ['STAFF', 'CUSTOMER', 'EXTERNAL_COLLABORATOR'];

  constructor(
    private route: ActivatedRoute,
    private userProjectService: UserProjectService,
    private projectService: ProjectService,
    public authService: AuthService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.projectId = +idParam;
      this.loadProject();
      this.loadUsers();
      this.checkIfUserIsAdm(this.projectId);
    } else {
      console.error('ID do projeto não fornecido na rota.');
    }

    const transferredUser = sessionStorage.getItem('transferSuccess');
    if (transferredUser) {
      this.toast.showSuccess(`Gerência transferida para ${transferredUser}`);
      sessionStorage.removeItem('transferSuccess');
    }
  }

  openTransferAdminModal(): void {
    this.showTransferModal = true;
  }

  cancelTransfer(): void {
    this.showTransferModal = false;
  }

  handleTransferAdmin(event: { user: UserResponse }): void {
    const newAdmin = event.user;
    const currentAdmin = this.users.find(u => u.role === 'ADMIN');
    if (!currentAdmin) {
      alert('Nenhum gerente atual encontrado.');
      return;
    }

    this.loading = true;

    this.userProjectService.addUserToProject({
      userId: newAdmin.id,
      projectId: this.projectId,
      role: 'ADMIN'
    }).subscribe({
      next: () => {
        this.userProjectService.addUserToProject({
          userId: currentAdmin.userId,
          projectId: this.projectId,
          role: 'STAFF'
        }).subscribe({
          next: () => {
            this.loading = false;
            this.showTransferModal = false;

            sessionStorage.setItem('transferSuccess', newAdmin.name);

            location.reload();
          },
          error: (err) => {
            console.error('Erro ao rebaixar antigo gerente', err);
            this.loading = false;
            this.toast.showError('Erro ao rebaixar o gerente antigo');
          }
        });
      },
      error: (err) => {
        console.error('Erro ao definir novo gerente', err);
        this.loading = false;
        this.toast.showError('Erro ao definir novo gerente');
      }
    });
  }

  private checkIfUserIsAdm(projectId: number): void {
    const user = this.authService.getUser();
    if (!user?.id) {
      this.isAdmInProject = false;
      return;
    }

    this.userProjectService.getUsersByProject(projectId).subscribe({
      next: (users) => {
        const match = users.find(u => u.userId === user.id && u.role === 'ADMIN');
        this.isAdmInProject = !!match;
      },
      error: (err) => {
        console.error('Erro ao verificar role do usuário no projeto:', err);
        this.isAdmInProject = false;
      }
    });
  }

  loadProject(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => (this.project = project),
      error: (err) => console.error('Erro ao carregar projeto', err)
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userProjectService.getUsersByProject(this.projectId).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: (res) => {
        this.users = res.map(u => ({ ...u, roleBeforeChange: u.role }));
      },
      error: () => console.error('Erro ao carregar usuários')
    });
  }

  removeUser(user: UserProjectResponse): void {
    const currentUser = this.authService.getUser();

    if (user.role === 'ADMIN' && user.userId === currentUser?.id) {
      alert(
        'Um projeto não pode ficar sem um gerente. ' +
        'Adicione outro colaborador como gerente antes de sair do projeto.'
      );
      return;
    }

    if (confirm(`Deseja desassociar ${user.userName} do projeto ${this.project?.name}?`)) {
      this.loading = true;
      this.userProjectService.removeUserFromProject(user.projectId, user.userId).pipe(
        finalize(() => (this.loading = false))
      ).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Erro ao remover usuário', err)
      });
    }
  }

  openAddUserModal(): void {
    this.showAddModal = true;
  }

  cancelAdd(): void {
    this.showAddModal = false;
  }

  handleAddUser(event: { user: UserResponse; role: string; reassignAdmin?: boolean }): void {
    const payload = {
      userId: event.user.id,
      projectId: this.projectId,
      role: event.role
    };

    this.loading = true;

    if (event.reassignAdmin) {
      const currentAdmin = this.users.find(u => u.role === 'ADMIN');

      if (currentAdmin) {
        this.userProjectService.addUserToProject({
          userId: currentAdmin.userId,
          projectId: this.projectId,
          role: 'STAFF'
        }).subscribe({
          next: () => {
            this.userProjectService.addUserToProject(payload).subscribe({
              next: () => {
                this.loading = false;
                this.showAddModal = false;
                sessionStorage.setItem('transferSuccess', event.user.name);
                location.reload();
              },
              error: (err) => {
                console.error('Erro ao adicionar novo gerente', err);
                this.loading = false;
              }
            });
          },
          error: (err) => {
            console.error('Erro ao rebaixar gerente antigo', err);
            this.loading = false;
          }
        });
      }
      return;
    }

    this.userProjectService.addUserToProject(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showAddModal = false;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Erro ao adicionar usuário', err);
        this.loading = false;
      }
    });
  }

  changeUserRole(user: UserProjectResponse, oldRole: string): void {
    this.loading = true;
    this.userProjectService.addUserToProject({
      userId: user.userId,
      projectId: this.projectId,
      role: user.role
    }).pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Erro ao atualizar função do usuário:', err)
    });
  }
}
