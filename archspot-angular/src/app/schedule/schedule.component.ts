import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../core/services/project.service';
import { PhaseService } from '../core/services/phase.service';
import { AuthService } from '../core/services/auth.service';
import { UserProjectService } from '../core/services/user-project.service';
import Gantt from 'frappe-gantt';
import { ProjectResponse } from '../core/models/project.model';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  projectId!: number;
  project?: ProjectResponse;
  phases: any[] = [];
  gantt!: any;
  showCreateModal = false;
  showEditModal = false;
  selectedPhase: any = null;
  selectedPhaseIndex?: number;
  ganttViewMode: 'Day' | 'Month' | 'Year' = 'Month';

  userId: number | null = null;
  projectUsers: any[] = [];

  @ViewChild('ganttContainer', { static: false }) ganttContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private phaseService: PhaseService,
    private authService: AuthService,
    private userProjectService: UserProjectService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return console.error('ID do projeto não fornecido.');
    this.projectId = +idParam;

    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;

    this.loadProject();
    this.loadPhases();
    this.loadProjectUsers();
  }

  ngAfterViewInit(): void { }

  get isCustomerInProject(): boolean {
    if (!this.userId) return true;
    return this.projectUsers.find(u => u.userId === this.userId)?.role === 'CUSTOMER';
  }

  changeGanttView(view: 'Day' | 'Month' | 'Year') {
    this.ganttViewMode = view;
    if (this.gantt) this.gantt.change_view_mode(view);
  }

  openCreatePhaseModal(): void {
    if (!this.isCustomerInProject) this.showCreateModal = true;
  }

  openEditPhaseModal(phase: any, index: number): void {
    if (this.isCustomerInProject) return;
    this.selectedPhase = {
      ...phase,
      estimatedStartDate: this.formatDate(phase.estimatedStartDate),
      estimatedEndDate: this.formatDate(phase.estimatedEndDate),
      realStartDate: this.formatDate(phase.realStartDate),
      realEndDate: this.formatDate(phase.realEndDate)
    };
    this.selectedPhaseIndex = index + 1;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  private formatDate(date: any): string | null {
    return date ? new Date(date).toISOString().slice(0, 10) : null;
  }

  onPhaseCreated() {
    this.loadPhases();
  }

  canStartPhase(index: number): boolean {
    if (this.isCustomerInProject) return false;

    const phase = this.phases[index];

    // Não permitir iniciar fases já iniciadas ou concluídas
    if (phase.realStartDate || phase.status === 'IN_PROGRESS' || phase.status === 'COMPLETED')
      return false;

    const prevId = phase.previousPhaseId;

    // Sem predecessora → pode iniciar
    if (!prevId) return true;

    // Com predecessora → precisa que a predecessora tenha iniciado
    const prev = this.phases.find(p => p.id === prevId);
    if (!prev) return true; // fallback seguro caso dados venham inconsistentes

    return !!prev.realStartDate;;
  }

  canFinishPhase(index: number): boolean {
    if (this.isCustomerInProject) return false;
    const phase = this.phases[index];
    return !!phase.realStartDate && !phase.realEndDate;
  }

  startPhase(phase: any) {
    if (this.isCustomerInProject) return;

    this.phaseService.startPhase(phase.id).subscribe({
      next: () => {
        this.loadPhases();
        setTimeout(() => this.updateProjectRealDates(), 200);
      }
    });
  }

  finishPhase(phase: any) {
    if (this.isCustomerInProject) return;

    this.phaseService.finishPhase(phase.id).subscribe({
      next: () => {
        this.loadPhases();
        setTimeout(() => this.updateProjectRealDates(), 200);
      }
    });
  }

  updateProjectRealDates(): void {
    if (this.project?.status?.toUpperCase() === 'CANCELLED') {
      console.warn("Projeto cancelado — updateProjectRealDates() ignorado.");
      return;
    }
    this.phaseService.getPhasesByProjectId(this.projectId).subscribe({
      next: phases => {
        const realStartDates = phases
          .filter(p => p.realStartDate)
          .map(p => new Date(p.realStartDate));

        const realEndDates = phases
          .filter(p => p.realEndDate)
          .map(p => new Date(p.realEndDate));

        const realStartDate = realStartDates.length
          ? new Date(Math.min(...realStartDates.map(d => d.getTime())))
          : null;

        const realEndDate = realEndDates.length
          ? new Date(Math.max(...realEndDates.map(d => d.getTime())))
          : null;

        if (realStartDate || realEndDate) {
          this.projectService.updateProjectRealDates(this.projectId, realStartDate, realEndDate).subscribe({
            next: proj => {
              this.project = proj;
              console.log('Projeto atualizado com datas reais:', proj);
            },
            error: err => console.error('Erro ao atualizar projeto com datas reais', err)
          });
        }
      },
      error: err => console.error('Erro ao buscar fases para atualizar projeto', err)
    });
  }

  loadProject(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: project => (this.project = project)
    });
  }

  loadProjectUsers(): void {
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: users => (this.projectUsers = users)
    });
  }

  loadPhases(): void {
    this.phaseService.getPhasesByProjectId(this.projectId).subscribe({
      next: phases => {
        this.phases = phases
          .map((p: any) => ({
            ...p,
            previousPhaseId: p.previousPhaseId ?? p.predecessorId ?? null
          }))
          .sort((a, b) => new Date(a.estimatedStartDate).getTime() - new Date(b.estimatedStartDate).getTime());

        setTimeout(() => this.renderGantt(), 150);
      }
    });
  }

  undoPhase(phase: any) {
    if (this.isCustomerInProject) return;

    if (!phase.realStartDate) {
      this.toast.showInfo(`Etapa #${phase.id} não pode ser desfeita.`);
      return;
    }

    const updatedPhase: any = { ...phase };

    if (phase.realEndDate) {
      // fase já finalizada → volta para "iniciada"
      updatedPhase.status = 'IN_PROGRESS';
      updatedPhase.realEndDate = null;
    } else {
      // fase iniciada → volta para "não iniciada"
      updatedPhase.status = 'NOT_STARTED';
      updatedPhase.realStartDate = null;
      updatedPhase.realEndDate = null;
    }

    this.phaseService.updatePhase(phase.id, updatedPhase).subscribe({
      next: () => this.loadPhases(),
      error: err => {
        console.error('Erro ao desfazer fase:', err);
        this.toast.showError('Não foi possível desfazer a etapa.');
      }
    });
  }

  private resetSubsequentPhases(startIdx: number, resetFn: (p: any) => any) {
    const next = (i: number) => {
      if (i >= this.phases.length) {
        this.loadPhases();
        setTimeout(() => this.updateProjectRealDates(), 200);
        return;
      }

      const p = this.phases[i];
      if (!p.realStartDate && !p.realEndDate) return next(i + 1);

      this.phaseService.updatePhase(p.id, resetFn(p)).subscribe({
        next: () => next(i + 1)
      });
    };

    next(startIdx);
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
      view_mode: this.ganttViewMode,
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
