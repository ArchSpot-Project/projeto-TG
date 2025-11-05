import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/services/project.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectResponse } from '../../../core/models/project.model';

@Component({
  selector: 'app-projects-page',
  templateUrl: './projects-page.component.html',
  styleUrls: ['./projects-page.component.css']
})
export class ProjectsPageComponent implements OnInit {
  openProjects: ProjectResponse[] = [];
  closedProjects: ProjectResponse[] = [];
  showModal = false;
  loading = true;
  errorMessage = '';
  currentUserId!: number;
  currentUserName!: string;

  constructor(
    private projectService: ProjectService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProjects();
  }

  loadUserProjects(): void {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      this.errorMessage = 'Usuário não logado.';
      this.loading = false;
      return;
    }

    this.currentUserId = user.id;
    this.currentUserName = user.name;
    this.loading = true;

    this.projectService.getProjectsByUser(user.id).subscribe({
      next: (userProjects) => {
        if (!userProjects || userProjects.length === 0) {
          this.errorMessage = 'Nenhum projeto encontrado para o usuário.';
          this.loading = false;
          return;
        }

        const projectRequests = userProjects.map(up =>
          this.projectService.getProjectById(up.projectId)
        );

        forkJoin(projectRequests).subscribe({
          next: (projects: ProjectResponse[]) => {
            this.openProjects = projects.filter(
              p => p.status === 'PLANNED' || p.status === 'IN_PROGRESS'
            );
            this.closedProjects = projects.filter(
              p => p.status === 'COMPLETED' || p.status === 'CANCELLED'
            );
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.errorMessage = 'Erro ao carregar detalhes dos projetos.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erro ao carregar projetos do usuário.';
        this.loading = false;
      }
    });
  }

  goToProject(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  openModal(): void {
    this.showModal = true;
  }
}
