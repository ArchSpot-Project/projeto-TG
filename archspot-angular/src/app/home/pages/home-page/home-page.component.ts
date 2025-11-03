import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { forkJoin } from 'rxjs';
import { ProjectResponse } from '../../../core/models/project.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  openProjects: ProjectResponse[] = [];
  closedProjects: ProjectResponse[] = [];
  showModal = false;
  loading = true;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
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

  goToProjects(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  openModal(): void {
    this.showModal = true;
  }
}