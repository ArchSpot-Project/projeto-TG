import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { FinancialProjectRowDTO } from '../../../core/models/reports.model';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { ReportColumn } from '../../reports-table/reports-table.component';

@Component({
  selector: 'app-report-financeiro-projeto',
  templateUrl: './report-financeiro-projeto.component.html',
  styleUrls: ['./report-financeiro-projeto.component.css']
})

export class ReportFinanceiroProjetoComponent {
  form: FormGroup;
  rows: FinancialProjectRowDTO[] = [];
  loading = false;
  error = '';
  isGenerated = false;
  projetoSelecionadoNome: string | null = null;
  today: string;

  projects: { projectId: number; projectName: string }[] = [];

  private subs: Subscription = new Subscription();

  // colunas fixas do relatório
  colunas: ReportColumn[] = [
    { campo: 'description', label: 'Descrição' },
    { campo: 'value', label: 'Valor', pipe: 'currency', class: 'text-end' },
    { campo: 'status', label: 'Status', pipe: 'paymentStatus' },
    { campo: 'estimatedPaymentDate', label: 'Previsto', pipe: 'date', class: 'text-center' },
    { campo: 'realPaymentDate', label: 'Pago em', pipe: 'date', class: 'text-center' },
    { campo: 'paymentMethod', label: 'Forma de Pagamento', pipe: 'paymentMethod' },
  ];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      projectId: [null, Validators.required]
    });
    this.today = new Date().toLocaleDateString('pt-BR');
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
          // adaptações caso o shape seja diferente
          this.projects = projects.map(p => ({
            projectId: p.projectId ?? p.id ?? p.projectId,
            projectName: p.projectName ?? p.name ?? p.projectName
          }));
          this.loading = false;
        },
        error: (err) => {
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
      reportType: 'FINANCIAL_PROJECT',
      projectId: projectId
    };

    this.loading = true;
    this.error = '';
    this.subs.add(
      this.reportService.generateReport<FinancialProjectRowDTO>(payload).subscribe({
        next: (res) => {
          this.rows = res.rows ?? [];
          this.isGenerated = true;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao gerar relatório financeiro por projeto', err);
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
