import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { FinancialGeneralRowDTO } from '../../../core/models/reports.model';
import { ReportColumn } from '../../reports-table/reports-table.component';

@Component({
  selector: 'app-report-financeiro-geral',
  templateUrl: './report-financeiro-geral.component.html',
  styleUrls: ['./report-financeiro-geral.component.css']
})
export class ReportFinanceiroGeralComponent {

  form: FormGroup;
  rows: FinancialGeneralRowDTO[] = [];
  loading = false;
  error = '';
  isGenerated = false;

  colunas: ReportColumn[] = [
    { campo: 'projectName', label: 'Projeto' },
    { campo: 'status', label: 'Status financeiro', pipe: 'financialStatus' },
    { campo: 'totalValue', label: 'Total do Projeto', pipe: 'currency' },
    { campo: 'totalPaid', label: 'Total Pago', pipe: 'currency' },
    { campo: 'totalRemaining', label: 'Restante', pipe: 'currency' }
  ];

  constructor(private fb: FormBuilder, private reportService: ReportService) {
    this.form = this.fb.group({
      startDate: [null],
      endDate: [null],
      paymentMethod: [null],
      projectStatus: [null]
    });
  }

  gerarRelatorio(): void {
    this.error = '';
    this.loading = true;

    const filtros = {
      reportType: 'FINANCIAL_GENERAL',
      ...this.form.value
    };

    this.reportService.generateReport<FinancialGeneralRowDTO>(filtros).subscribe({
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
