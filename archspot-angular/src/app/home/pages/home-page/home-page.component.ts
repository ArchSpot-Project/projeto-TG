import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectResponse, ProjectService } from '../../../core/services/project.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  openProjects: ProjectResponse[] = [];
  closedProjects: ProjectResponse[] = [];

  constructor(
    private projectService: ProjectService,
    @Inject(AuthService) private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProjects();
  }

  loadUserProjects(): void {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      console.error('Usuário não logado');
      return;
    }

    this.projectService.getProjectsByUser(user.id).subscribe({
      next: (userProjects) => {
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
          },
          error: err => console.error('Erro ao carregar detalhes dos projetos', err)
        });
      },
      error: err => console.error('Erro ao carregar projetos do usuário', err)
    });
  }

  goToProjects(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }
}
