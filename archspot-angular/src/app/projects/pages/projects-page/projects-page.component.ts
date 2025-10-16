import { Component, Inject, OnInit } from '@angular/core';
import { ProjectService, ProjectResponse } from '../../../services/project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects-page',
  templateUrl: './projects-page.component.html',
  styleUrls: ['./projects-page.component.css']
})
export class ProjectsPageComponent implements OnInit {
  openProjects: ProjectResponse[] = [];
  closedProjects: ProjectResponse[] = [];

  constructor(@Inject(ProjectService) private projectService: ProjectService, private router: Router) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  //carregando projetos planned/in progress e completed/cancelled
  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.openProjects = projects.filter(p => p.status === 'PLANNED' || p.status === 'IN_PROGRESS');
        this.closedProjects = projects.filter(p => p.status === 'COMPLETED' || p.status === 'CANCELLED');
      },
      error: (err) => console.error('Erro ao carregar projetos', err)
    });
  }

  goToProject(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }
}
