import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectResponse, ProjectService } from '../core/services/project.service';
import { PhaseService } from '../core/services/phase.service';
import { AuthService } from '../core/services/auth.service';
import { UserProjectService } from '../core/services/user-project.service';
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
  showCreateModal = false;
  showEditModal = false;
  selectedPhase: any = null;
  selectedPhaseIndex?: number;

  userRole: string | null = null;       // role global do usuário
  userId: number | null = null;         // id do usuário
  projectUsers: any[] = [];             // lista de usuários no projeto

  @ViewChild('ganttContainer', { static: false }) ganttContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private phaseService: PhaseService,
    private authService: AuthService,
    private userProjectService: UserProjectService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return console.error('ID do projeto não fornecido.');
    this.projectId = +idParam;

    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;
    this.userRole = currentUser?.userRole || null;

    this.loadProject();
    this.loadProjectUsers();
    this.loadPhases();
  }

  ngAfterViewInit(): void {
    if (this.phases.length > 0) this.renderGantt();
  }

  /** Verifica se o usuário logado é CUSTOMER neste projeto */
  get isCustomerInProject(): boolean {
    if (!this.userId) return true;
    const user = this.projectUsers.find(u => u.userId === this.userId);
    return user?.role === 'CUSTOMER';
  }

  /** Abre modal de criação */
  openCreatePhaseModal(): void {
    if (this.isCustomerInProject) return;
    this.showCreateModal = true;
  }

  /** Abre modal de edição */
  openEditPhaseModal(phase: any, index: number): void {
    if (this.isCustomerInProject) return;

    this.selectedPhase = {
      ...phase,
      estimatedStartDate: this.formatDateForInput(phase.estimatedStartDate),
      estimatedEndDate: this.formatDateForInput(phase.estimatedEndDate),
      realStartDate: this.formatDateForInput(phase.realStartDate),
      realEndDate: this.formatDateForInput(phase.realEndDate)
    };
    this.selectedPhaseIndex = index + 1;
    this.showEditModal = true;
  }

  private formatDateForInput(date: any): string | null {
    if (!date) return null;
    return new Date(date).toISOString().slice(0, 10);
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  //adicionar nova fase
  onPhaseCreated(newPhase: any) {
    this.phases.push(newPhase);
    this.updatePhaseStatus();
    setTimeout(() => this.renderGantt(), 200);
    location.reload();
  }

  //permitir iniciar fase
  canStartPhase(index: number): boolean {
    if (this.isCustomerInProject) return false;
    const phase = this.phases[index];
    return !phase.realStartDate && phase.status !== 'IN_PROGRESS' && phase.status !== 'COMPLETED';
  }

  //permitir finalizar fase
  canFinishPhase(index: number): boolean {
    if (this.isCustomerInProject) return false;
    const phase = this.phases[index];
    return phase.status === 'IN_PROGRESS' || (!!phase.realStartDate && phase.status !== 'COMPLETED');
  }

  startPhase(phase: any) {
    if (this.isCustomerInProject) return;
    this.phaseService.startPhase(phase.id).subscribe({
      next: updated => {
        phase.realStartDate = updated.realStartDate;
        phase.status = 'IN_PROGRESS';
        this.updatePhaseStatus();
      },
      error: err => alert(err.error?.message || 'Finalize a etapa anterior antes de iniciar esta fase.')
    });
  }

  finishPhase(phase: any) {
    if (this.isCustomerInProject) return;
    this.phaseService.finishPhase(phase.id).subscribe({
      next: updated => {
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

  loadProjectUsers(): void {
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: users => this.projectUsers = users,
      error: err => console.error('Erro ao carregar usuários do projeto', err)
    });
  }

  loadPhases(): void {
    this.phaseService.getPhasesByProjectId(this.projectId).subscribe({
      next: phases => {
        this.phases = phases;
        this.updatePhaseStatus();
        setTimeout(() => this.renderGantt(), 200);
      },
      error: err => console.error(err)
    });
  }

  updatePhaseStatus(): void {
    const today = new Date();
    this.phases.forEach(p => {
      if (p.realEndDate) p.status = 'COMPLETED';
      else if (p.realStartDate) p.status = 'IN_PROGRESS';
      else if (new Date(p.estimatedEndDate) < today) p.status = 'OVERDUE';
      else p.status = 'NOT_STARTED';
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
