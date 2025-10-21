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
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.projectId) {
      console.error('ID do projeto não encontrado na URL.');
      return;
    }

    this.loadProject();
    this.loadPhases();
  }

  ngAfterViewInit(): void {
    // renderizar o gantt se as fases estiverem carregadas
    if (this.phases.length > 0) {
      this.renderGantt();
    }
  }

  loadProject(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => this.project = project,
      error: (err) => console.error('Erro ao carregar projeto', err)
    });
  }

  loadPhases(): void {
    this.phaseService.getPhasesByProjectId(this.projectId).subscribe({
      next: (phases) => {
        this.phases = phases;
        setTimeout(() => this.renderGantt(), 200);
      },
      error: (err) => console.error('Erro ao carregar fases do projeto', err)
    });
  }

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
