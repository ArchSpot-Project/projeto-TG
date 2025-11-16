import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { ScheduleGeneralRowDTO } from '../../../core/models/reports.model';
import { ReportColumn } from '../../reports-table/reports-table.component';

@Component({
  selector: 'app-report-cronograma-geral',
  templateUrl: './report-cronograma-geral.component.html',
  styleUrls: ['./report-cronograma-geral.component.css']
})
export class ReportCronogramaGeralComponent {

  form: FormGroup;
  rows: ScheduleGeneralRowDTO[] = [];
  loading = false;
  error = '';
  isGenerated = false;
  today: string;

  colunas: ReportColumn[] = [
    { campo: 'projectName', label: 'Projeto' },
    { campo: 'status', label: 'Status', pipe: 'statusTranslate' },
    { campo: 'percentComplete', label: '% Concluído', pipe: 'percent', class: 'text-center' },
    { campo: 'percentPaid', label: '% Pago', pipe: 'percent', class: 'text-center' },
    { campo: 'estimatedStartDate', label: 'Previsão Início', pipe: 'date', class: 'text-center' },
    { campo: 'estimatedEndDate', label: 'Previsão Término', pipe: 'date', class: 'text-center' },
    { campo: 'realStartDate', label: 'Real Início', pipe: 'date', class: 'text-center' },
    { campo: 'realEndDate', label: 'Real Término', pipe: 'date', class: 'text-center' }
  ];

  constructor(private fb: FormBuilder, private reportService: ReportService) {
    this.form = this.fb.group({
      startDate: [null],
      endDate: [null],
      projectStatus: [null]
      
    });
    this.today = new Date().toLocaleDateString('pt-BR');
  }

  gerarRelatorio(): void {
    this.error = '';
    this.loading = true;

    const filtros = {
      reportType: 'SCHEDULE_GENERAL',
      ...this.form.value
    };

    this.reportService.generateReport<ScheduleGeneralRowDTO>(filtros).subscribe({
      next: res => {
        this.rows = res.rows;
        this.isGenerated = true;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao gerar relatório.';
        this.loading = false;
      }
    });
  }

  limparFiltros(): void {
    this.form.reset();
    this.error = '';
  }

  voltarEdicao(): void {
    this.isGenerated = false;
    this.rows = [];
  }
}
