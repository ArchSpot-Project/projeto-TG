import { Component, OnInit, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { PhaseService } from '../../../core/services/phase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-status-bar',
  templateUrl: './project-status-bar.component.html',
  styleUrls: ['./project-status-bar.component.css']
})
export class ProjectStatusBarComponent implements OnInit, AfterViewInit {
  @Input() projectId!: number;

  phases: any[] = [];
  lastCompletedIndex = -1;
  progressWidthPx = 0;

  constructor(
    private phaseService: PhaseService,
    private elRef: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.projectId) {
      console.error('projectId não informado.');
      return;
    }

    this.loadPhases();
  }

  goToSchedule(): void {
    if (this.projectId) {
      this.router.navigate([`/projects/${this.projectId}/schedule`]);
    }
  }

  ngAfterViewInit(): void {
    // garantir que a linha seja atualizada após renderizar
    setTimeout(() => this.updateProgressLine(), 300);
  }

  loadPhases(): void {
    this.phaseService.getPhasesByProjectId(this.projectId).subscribe({
      next: (phases) => {
        this.phases = phases.map(p => ({
          ...p,
          estimatedStartDate: new Date(p.estimatedStartDate),
          estimatedEndDate: new Date(p.estimatedEndDate)
        }));
        this.updateProgressLine();
      },
      error: (err) => console.error('Erro ao carregar fases do projeto', err)
    });
  }

  updateProgressLine(): void {
    if (!this.phases.length) {
      this.progressWidthPx = 0;
      this.lastCompletedIndex = -1;
      return;
    }

    // identifica a última fase concluída
    this.lastCompletedIndex = this.phases.map(p => p.status).lastIndexOf('COMPLETED');
    const timeline = this.elRef.nativeElement.querySelector('.timeline-container');
    const dots = timeline?.querySelectorAll('.timeline-dot');

    if (!dots || dots.length === 0) return;

    const line = timeline.querySelector('.timeline-line');
    const lineRect = line.getBoundingClientRect();
    const firstDotRect = dots[0].getBoundingClientRect();

    if (this.lastCompletedIndex === -1) {
      this.progressWidthPx = 0;
      return;
    }

    // ultimo ponto concluido
    const lastDotRect = dots[this.lastCompletedIndex].getBoundingClientRect();
    const lineLeft = lineRect.left;
    const centerLastDot = lastDotRect.left + lastDotRect.width / 2;

    // largura entre início da linha e o centro do último ponto
    this.progressWidthPx = centerLastDot - lineLeft;
  }
}