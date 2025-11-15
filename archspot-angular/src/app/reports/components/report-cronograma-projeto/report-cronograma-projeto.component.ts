import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScheduleProjectRowDTO } from '../../../core/models/reports.model';
import { ProjectService } from '../../../core/services/project.service';
import { ReportService } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { ReportColumn } from '../../reports-table/reports-table.component';

@Component({
  selector: 'app-report-cronograma-projeto',
  templateUrl: './report-cronograma-projeto.component.html',
  styleUrls: ['./report-cronograma-projeto.component.css']
})
export class ReportCronogramaProjetoComponent implements OnInit, OnDestroy {

  form: FormGroup;
  rows: ScheduleProjectRowDTO[] = [];
  loading = false;
  error = '';
  isGenerated = false;

  projetoSelecionadoNome: string | null = null;
  projects: { projectId: number; projectName: string }[] = [];

  private subs = new Subscription();

  colunas: ReportColumn[] = [
    { campo: 'phaseName', label: 'Etapa' },
    { campo: 'status', label: 'Status', pipe: 'phaseStatus' },
    { campo: 'percentComplete', label: '% Concluído' },
    { campo: 'estimatedStartDate', label: 'Início Previsto', pipe: 'date' },
    { campo: 'estimatedEndDate', label: 'Término Previsto', pipe: 'date' },
    { campo: 'realStartDate', label: 'Início Real', pipe: 'date' },
    { campo: 'realEndDate', label: 'Término Real', pipe: 'date' },
  ];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private reportService: ReportService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      projectId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.loading = true;
    this.error = '';

    const currentUser = this.authService.getUser();
    if (!currentUser) return;

    this.subs.add(
      this.projectService.getProjectsByUser(currentUser.id).subscribe({
        next: (projects: any[]) => {
          this.projects = projects.map(p => ({
            projectId: p.projectId ?? p.id,
            projectName: p.projectName ?? p.name
          }));
          this.loading = false;
        },
        error: err => {
          console.error('Erro ao carregar projetos', err);
          this.error = 'Erro ao carregar projetos.';
          this.loading = false;
        }
      })
    );
  }

  gerarRelatorio(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const projectId = Number(this.form.value.projectId);

    const projeto = this.projects.find(p => p.projectId === projectId);
    this.projetoSelecionadoNome = projeto ? projeto.projectName : null;

    const payload = {
      reportType: 'SCHEDULE_PROJECT',
      projectId: projectId
    };

    this.loading = true;
    this.error = '';

    this.subs.add(
      this.reportService.generateReport<ScheduleProjectRowDTO>(payload).subscribe({
        next: res => {
          this.rows = res.rows ?? [];
          this.isGenerated = true;
          this.loading = false;
        },
        error: err => {
          console.error('Erro ao gerar relatório', err);
          this.error = 'Erro ao gerar relatório.';
          this.loading = false;
        }
      })
    );
  }

  voltarEdicao(): void {
    this.isGenerated = false;
    this.rows = [];
    this.form.reset();
    this.projetoSelecionadoNome = null;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
