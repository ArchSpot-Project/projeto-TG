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
      console.error('Usuário não logado');
      return;
    }

    const userId = user.id;

    this.projectService.getProjectsByUser(userId).subscribe({
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

  goToProject(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  openModal(): void {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      alert('Usuário não logado');
      return;
    }
    this.currentUserId = user.id;
    this.currentUserName = user.name;
    this.showModal = true;
  }
}
