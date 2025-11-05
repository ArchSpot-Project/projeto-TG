import { Component } from '@angular/core';
import { InstallmentService } from '../../../core/services/installment.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin, of, switchMap, map } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Parcela {
  projectName: string;
  projectStatus: string;
  name: string;
  amount: number;
  status: string;
  paymentMethod: string;
  estimatedPaymentDate: string;
  realPaymentDate: string | null;
}

@Component({
  selector: 'app-report-financeiro-geral',
  templateUrl: './report-financeiro-geral.component.html',
  styleUrls: ['./report-financeiro-geral.component.css']
})
export class ReportFinanceiroGeralComponent {
  isGenerated = false;
  loading = false;
  error = '';
  parcelas: Parcela[] = [];

  formData = {
    periodoInicio: '',
    periodoFim: '',
    status: 'todos',
    metodoPagamento: 'todos'
  };

  private statusMap: Record<string, string> = {
    'todos': 'todos',
    'pendente': 'PENDING',
    'paga': 'PAID',
    'em_atraso': 'OVERDUE'
  };

  private metodoMap: Record<string, string> = {
    'todos': 'todos',
    'boleto': 'BOLETO',
    'pix': 'PIX',
    'cartao_credito': 'CREDIT_CARD',
    'cartao_debito': 'DEBIT_CARD',
    'transferencia': 'PIX',
    'cheque': 'CHECK',
    'dinheiro': 'CASH'
  };

  constructor(
    private installmentService: InstallmentService,
    private projectService: ProjectService,
    private authService: AuthService
  ) { }

  gerarRelatorio(): void {
    this.error = '';

    // validação de período
    if (this.formData.periodoInicio && this.formData.periodoFim) {
      const inicio = new Date(this.formData.periodoInicio);
      const fim = new Date(this.formData.periodoFim);
      if (inicio > fim) {
        alert('A data inicial deve ser menor que a data final.');
        this.limparFiltros();
        return;
      }
    }

    this.isGenerated = true;
    this.loading = true;

    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.error = 'Usuário não está logado.';
      this.loading = false;
      return;
    }

    const userId = currentUser.id;

    this.projectService.getProjectsByUser(userId).pipe(
      switchMap(userProjects => {
        if (!userProjects || userProjects.length === 0) {
          this.error = 'Nenhum projeto encontrado para este usuário.';
          this.loading = false;
          return of([]);
        }

        const detailedRequests = userProjects.map(up =>
          this.projectService.getProjectById(up.projectId).pipe(
            switchMap(project =>
              this.installmentService.getInstallmentsByProject(project.id).pipe(
                map(parcelas =>
                  parcelas.map(p => ({
                    ...p,
                    projectName: project.name,
                    projectStatus: project.status
                  }))
                )
              )
            )
          )
        );

        return forkJoin(detailedRequests);
      })
    ).subscribe({
      next: (all) => {
        let merged = all.flat();

        // filtro por status da parcela
        if (this.formData.status !== 'todos') {
          const backendStatus = this.statusMap[this.formData.status];
          merged = merged.filter(p => p.paymentStatus === backendStatus);
        }

        // filtro por método de pagamento
        if (this.formData.metodoPagamento !== 'todos') {
          const backendMetodo = this.metodoMap[this.formData.metodoPagamento];
          merged = merged.filter(p => (p.paymentMethod ?? '-') === backendMetodo);
        }

        // filtro por datas (usando estimatedPaymentDate)
        const startDate = this.formData.periodoInicio ? new Date(this.formData.periodoInicio) : null;
        const endDate = this.formData.periodoFim ? new Date(this.formData.periodoFim) : null;

        if (startDate) {
          merged = merged.filter(p => new Date(p.estimatedPaymentDate) >= startDate);
        }
        if (endDate) {
          merged = merged.filter(p => new Date(p.estimatedPaymentDate) <= endDate);
        }

        // mapeia os dados finais para exibição
        this.parcelas = merged.map(p => ({
          projectName: p.projectName,
          projectStatus: p.projectStatus ?? '-',
          name: p.description ?? 'Parcela',
          amount: p.amount,
          status: p.paymentStatus ?? '-',
          paymentMethod: p.paymentMethod ?? '-',
          estimatedPaymentDate: p.estimatedPaymentDate,
          realPaymentDate: p.realPaymentDate ?? null
        }));

        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar parcelas:', err);
        this.error = 'Erro ao buscar parcelas.';
        this.loading = false;
      }
    });
  }

  voltarEdicao(): void {
    this.isGenerated = false;
    this.parcelas = [];
  }

  limparFiltros(): void {
    this.formData = {
      periodoInicio: '',
      periodoFim: '',
      status: 'todos',
      metodoPagamento: 'todos'
    };
    this.error = '';
  }

  baixarPDF(): void {
    const tabela = document.getElementById('relatorioTabela');
    if (!tabela) return;

    const container = document.createElement('div');
    container.style.padding = '15px';
    container.style.backgroundColor = 'white';
    container.style.display = 'inline-block';
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.appendChild(tabela.cloneNode(true));
    document.body.appendChild(container);

    html2canvas(container, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ArchSpot - Relatório de Pagamentos Gerais', pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth, pdfHeight);
      pdf.save('relatorio_pagamentos_gerais.pdf');

      document.body.removeChild(container);
    });
  }

  mapStatus(status?: string): string {
    switch (status) {
      case 'OVERDUE': return 'Atrasado';
      case 'IN_PROGRESS': return 'Em andamento';
      case 'COMPLETED': return 'Concluído';
      case 'CANCELLED': return 'Cancelado';
      case 'PENDING': return 'Pendente';
      case 'PAID': return 'Paga';
      case 'em_atraso': return 'Em atraso';
      default: return status ?? '-';
    }
  }
}
