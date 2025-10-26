import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-project-status-bar',
  templateUrl: './project-status-bar.component.html',
  styleUrls: ['./project-status-bar.component.css']
})
export class ProjectStatusBarComponent implements OnInit {
  @Input() projectId!: number;
  phases: any[] = [];
  minDate!: Date;
  maxDate!: Date;
  @Output() statusBarClick = new EventEmitter<void>();

  constructor(private phaseService: PhaseService) { }

  handleClick() {
    this.statusBarClick.emit();
  }
  
  ngOnInit(): void {
    if (!this.projectId) {
      console.error('projectId não informado.');
      return;
    }

    this.loadPhases();
  }

  loadPhases(): void {
    this.phaseService.getPhasesByProjectId(this.projectId).subscribe({
      next: (phases) => {
        this.phases = phases.map(p => ({
          ...p,
          estimatedStartDate: new Date(p.estimatedStartDate),
          estimatedEndDate: new Date(p.estimatedEndDate)
        }));
      },
      error: (err) => console.error('Erro ao carregar fases do projeto', err)
    });
  }
}
