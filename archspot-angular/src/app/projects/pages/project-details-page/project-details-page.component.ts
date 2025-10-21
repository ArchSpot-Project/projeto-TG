import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService, ProjectResponse } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-details-page',
  templateUrl: './project-details-page.component.html',
  styleUrl: './project-details-page.component.css'
})
export class ProjectDetailsPageComponent {
  project?: ProjectResponse;
  loading = true;
  errorMessage = '';

  constructor(
    @Inject(ProjectService) private projectService: ProjectService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProject();
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
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar projeto:', err);
        this.errorMessage = 'Erro ao carregar o projeto.';
        this.loading = false;
      }
    });
  }
}
