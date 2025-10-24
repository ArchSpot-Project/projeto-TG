import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserProjectService, UserProjectResponse } from '../../../core/services/user-project.service';
import { ProjectService, ProjectResponse } from '../../../core/services/project.service';
import { UserResponse } from '../../../core/services/search-user.service';
import { AuthService } from '../../../core/services/auth.service';

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
  roles = ['ADMIN', 'STAFF', 'CUSTOMER'];

  constructor(
    private route: ActivatedRoute,
    private userProjectService: UserProjectService,
    private projectService: ProjectService,
    public authService: AuthService 
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
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: (res) => {
        this.users = res.map(u => ({ ...u, roleBeforeChange: u.role }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        console.error('Erro ao carregar usuários');
      }
    });
  }

  removeUser(user: UserProjectResponse): void {
    const currentUser = this.authService.getUser();

    if (user.role === 'ADMIN' && user.userId === currentUser?.id) {
      alert(
        'Um projeto não pode ficar sem um gerente. ' +
        'Adicione outro colaborador como gerente antes de mudar sua função ou sair do projeto.'
      );
      window.location.href = window.location.href;
      return;
    }

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

  handleAddUser(event: { user: UserResponse; role: string; reassignAdmin?: boolean }): void {
    const payload = {
      userId: event.user.id,
      projectId: this.projectId,
      role: event.role
    };

    if (event.reassignAdmin) {
      const currentAdmin = this.users.find(u => u.role === 'ADMIN');

      if (currentAdmin) {
        this.userProjectService.addUserToProject({
          userId: currentAdmin.userId,
          projectId: this.projectId,
          role: 'STAFF'
        }).subscribe({
          next: () => {
            this.userProjectService.addUserToProject(payload).subscribe(() => {
              this.loadUsers();
              alert(`Novo gerente definido: ${event.user.name}. O antigo gerente foi rebaixado.`);
            });
          },
          error: err => console.error('Erro ao rebaixar antigo gerente:', err)
        });
        return;
      }
    }

    this.userProjectService.addUserToProject(payload).subscribe({
      next: () => {
        this.loadUsers();
        this.showAddModal = false;
      },
      error: err => console.error('Erro ao adicionar usuário', err)
    });
  }

  changeUserRole(user: UserProjectResponse, oldRole: string) {
    const currentUser = this.authService.getUser();
    const currentAdmin = this.users.find(u => u.role === 'ADMIN');

    // se outro usuário for promovido a gerente
    if (user.role === 'ADMIN' && currentAdmin && currentAdmin.userId !== user.userId) {
      const confirmed = confirm(
        `⚠️ ATENÇÃO: ${user.userName} será promovido(a) a gerente. ` +
        `O atual gerente (${currentAdmin.userName}) será rebaixado(a) para colaborador. Deseja continuar?`
      );

      if (!confirmed) {
        user.role = oldRole;
        return;
      }

      // muda a role do gerente atual
      this.userProjectService.addUserToProject({
        userId: currentAdmin.userId,
        projectId: this.projectId,
        role: 'STAFF'
      }).subscribe({
        next: () => {
          // promove novo gerente
          this.userProjectService.addUserToProject({
            userId: user.userId,
            projectId: this.projectId,
            role: 'ADMIN'
          }).subscribe(() => {
            // TODO: nao esta atualizando realmente - so depois do f5 - corrigir
            this.loadUsers();
            this.loadProject();
          });
        },
        error: err => console.error('Erro ao rebaixar antigo gerente:', err)
      });

      return;
    }

    //atualização comum
    this.userProjectService.addUserToProject({
      userId: user.userId,
      projectId: this.projectId,
      role: user.role
    }).subscribe(() => {
      this.loadUsers();
      this.loadProject();
    });
  }

  getAvailableRolesForUser(user: UserProjectResponse): string[] {
    const currentUser = this.authService.getUser();
    if (user.userId === currentUser?.id) {
      return [user.role];
    }
    return this.roles;
  }
}
