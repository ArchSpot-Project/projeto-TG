import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css']
})
export class ProjectCardComponent {
  @Input() project: any;
  @Input() variant: 'compact' | 'detailed' = 'compact';

  constructor(private router: Router) {}

  goToProjects(id?: number): void {
    const projectId = id ?? this.project?.id;
    if (projectId) {
      this.router.navigate(['/projects', projectId]);
    }
  }
}
