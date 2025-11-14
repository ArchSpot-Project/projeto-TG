import { ActivatedRoute, Router } from "@angular/router";
import { ProjectService } from "../../../core/services/project.service";
import { UserProjectService } from "../../../core/services/user-project.service";
import { AuthService } from "../../../core/services/auth.service";
import { Component, Inject } from "@angular/core";
import { User } from "../../../core/models/user.model";
import { ProjectResponse } from "../../../core/models/project.model";

@Component({
  selector: 'app-project-details-page',
  templateUrl: './project-details-page.component.html',
  styleUrls: ['./project-details-page.component.css']
})
export class ProjectDetailsPageComponent {
  currentUser?: User | null;
  project?: ProjectResponse;
  loading = true;
  errorMessage = '';
  isAdminInProject = false;
  currentUserRole: string = '';

  // edição
  editing = false;
  tempName = '';
  tempDescription = '';

  constructor(
    @Inject(ProjectService) private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userProjectService: UserProjectService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadProject();
    const projectId = Number(this.route.snapshot.paramMap.get('id'));
    if (projectId) this.loadCurrentUserRole(projectId);
  }

  private loadCurrentUserRole(projectId: number): void {
    if (!this.currentUser?.id) return;

    this.userProjectService.getUsersByProject(projectId).subscribe({
      next: (users) => {
        const user = users.find(u => u.userId === this.currentUser?.id);
        this.currentUserRole = user ? user.role : '';
        this.isAdminInProject = ['ADMIN'].includes(this.currentUserRole);
      },
      error: () => {
        this.currentUserRole = '';
        this.isAdminInProject = false;
      }
    });
  }

  loadProject(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Projeto inválido.';
      this.loading = false;
      return;
    }

    this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        this.project = project;
        this.tempName = project.name;
        this.tempDescription = project.description || '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar projeto:', err);
        this.errorMessage = 'Erro ao carregar o projeto.';
        this.loading = false;
      }
    });
  }

  // ativa edição
  renameProject(): void {
    if (!this.project) return;
    this.editing = true;
    this.tempName = this.project.name;
    this.tempDescription = this.project.description || '';
  }

  // salva alterações
  saveEdit(): void {
    if (!this.project) return;

    this.projectService.updateProjectTitleAndDescription(this.project.id, {
      name: this.tempName,
      description: this.tempDescription
    }).subscribe({
      next: (updatedProject) => {
        this.project = updatedProject;
        this.editing = false;
      },
      error: (err) => console.error('Erro ao atualizar projeto:', err)
    });
  }

  // cancela a edição
  cancelEdit(): void {
    this.editing = false;
  }

  finalizeProject(): void {
    if (!this.project) return;

    this.projectService.finalizeProject(this.project.id).subscribe({
      next: (updatedProject) => {
        this.project = updatedProject;
        alert('Projeto finalizado com sucesso.');
      },
      error: (err) => console.error('Erro ao finalizar projeto:', err)
    });
  }

  cancelProject(): void {
    if (!this.project) return;

    this.projectService.cancelProject(this.project.id).subscribe({
      next: (updatedProject) => {
        this.project = updatedProject;
        alert('Projeto cancelado com sucesso.');
      },
      error: (err) => console.error('Erro ao cancelar projeto:', err)
    });
  }

  deleteProject(): void {
    if (!this.project) return;

    const confirmed = confirm(`Deseja realmente excluir o projeto "${this.project.name}"?`);
    if (!confirmed) return;

    this.projectService.deleteProject(this.project.id).subscribe({
      next: () => {
        alert('Projeto excluído com sucesso.');
        this.router.navigate(['/projects']);
      },
      error: (err) => console.error('Erro ao excluir projeto:', err)
    });
  }

  getDateLabel(type: 'start' | 'end'): string {
    if (!this.project) return type === 'start' ? 'Início:' : 'Fim:';

    const hasReal = type === 'start' ? this.project.realStartDate : this.project.realEndDate;
    const hasEstimated = type === 'start' ? this.project.estimatedStartDate : this.project.estimatedEndDate;

    if (hasReal) return type === 'start' ? 'Início real:' : 'Término real:';
    if (hasEstimated) return type === 'start' ? 'Início estimado:' : 'Término estimado:';
    return type === 'start' ? 'Início:' : 'Fim:';
  }

  getDateToDisplay(type: 'start' | 'end'): string | null {
    if (!this.project) return null;

    const real = type === 'start' ? this.project.realStartDate : this.project.realEndDate;
    const estimated = type === 'start' ? this.project.estimatedStartDate : this.project.estimatedEndDate;

    const dateValue = real || estimated;
    if (!dateValue) return null;

    const parsedDate = new Date(dateValue);
    return parsedDate.toLocaleDateString('pt-BR');
  }
}