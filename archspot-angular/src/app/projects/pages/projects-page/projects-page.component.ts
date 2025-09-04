import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects-page',
  templateUrl: './projects-page.component.html',
  styleUrl: './projects-page.component.css'
})
export class ProjectsPageComponent {

  constructor(private router: Router) { }

  goToProjects(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }
}
