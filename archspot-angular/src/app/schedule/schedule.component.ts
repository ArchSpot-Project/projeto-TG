import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectResponse, ProjectService } from '../core/services/project.service';
import { PhaseService } from '../core/services/phase.service';
import Gantt from 'frappe-gantt';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  projectId!: number;
  project?: ProjectResponse;
  phases: any[] = [];
  gantt!: Gantt;

  @ViewChild('ganttContainer', { static: false }) ganttContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private phaseService: PhaseService
  ) { }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.projectId) return console.error('ID do projeto não encontrado na URL.');

    this.loadProject();
    this.loadPhases();
  }

  ngAfterViewInit(): void {
    if (this.phases.length > 0) this.renderGantt();
  }

  //validação etapa predecessora
  canStartPhase(index: number): boolean {
    const phase = this.phases[index];

    // se já foi iniciada ou finalizada, não pode iniciar
    if (phase.status === 'IN_PROGRESS' || phase.status === 'COMPLETED') return false;

    // se realStartDate já está preenchida, então a fase já está em andamento
    if (phase.realStartDate) return false;

    return true;
  }

  canFinishPhase(index: number): boolean {
    const phase = this.phases[index];

    // pode finalizar se estiver em andamento ou se realStartDate estiver preenchida
    return phase.status === 'IN_PROGRESS' || (!!phase.realStartDate && phase.status !== 'COMPLETED');
  }

  startPhase(phase: any) {
    this.phaseService.startPhase(phase.id).subscribe({
      next: updated => {
        phase.realStartDate = updated.realStartDate;
        phase.status = 'IN_PROGRESS';
        this.updatePhaseStatus();
      },
      error: err => {
        // erro caso a etapa predecessora não esteja COMPLETED
        alert(err.error?.message || 'Finalize a etapa anterior antes de iniciar esta fase.');
        console.error(err);
      }
    });
  }

  finishPhase(phase: any) {
    this.phaseService.finishPhase(phase.id).subscribe({
      next: updated => {
        // término real da etapa com data e hora atual
        phase.realEndDate = updated.realEndDate;
        phase.status = 'COMPLETED';
        this.updatePhaseStatus();
      },
      error: err => console.error(err)
    });
  }

  loadProject(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: project => this.project = project,
      error: err => console.error('Erro ao carregar projeto', err)
    });
  }

  loadPhases(): void {
    this.phaseService.getPhasesByProjectId(this.projectId).subscribe({
      next: phases => {
        this.phases = phases;
        this.updatePhaseStatus();
        setTimeout(() => this.renderGantt(), 200);
      },
      error: err => console.error('Erro ao carregar fases', err)
    });
  }

  updatePhaseStatus() {
    const today = new Date();
    this.phases.forEach(p => {
      if (p.realEndDate) {
        p.status = 'COMPLETED';
      } else if (p.realStartDate) {
        p.status = 'IN_PROGRESS';
      } else if (new Date(p.estimatedEndDate) < today) {
        p.status = 'OVERDUE';
      } else {
        p.status = 'NOT_STARTED';
      }
    });
  }

  //gantt
  renderGantt(): void {
    if (!this.ganttContainer) return;

    const tasks = this.phases.map((p: any) => ({
      id: `phase-${p.id}`,
      name: p.name,
      start: new Date(p.estimatedStartDate).toISOString().slice(0, 10),
      end: new Date(p.estimatedEndDate).toISOString().slice(0, 10),
      progress: 100,
      custom_class: 'phase-bar'
    }));

    this.gantt = new Gantt(this.ganttContainer.nativeElement, tasks, {
      view_mode: 'Month',
      date_format: 'YYYY-MM-DD',
      custom_popup_html: (task: any) => `
        <div class="p-2">
          <h6>${task.name}</h6>
          <p>${task.start} → ${task.end}</p>
        </div>
      `
    } as any);
  }
}
