import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/services/project.service';
import { InstallmentService } from '../../../core/services/installment.service';
import { AuthService } from '../../../core/services/auth.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Parcela {
  name: string;
  description: string;
  amount: number;
  status: string;
  paymentMethod: string;
  estimatedPaymentDate: string;
  realPaymentDate: string | null;
}

@Component({
  selector: 'app-report-financeiro-projeto',
  templateUrl: './report-financeiro-projeto.component.html',
  styleUrls: ['./report-financeiro-projeto.component.css']
})
export class ReportFinanceiroProjetoComponent implements OnInit {
  isGenerated = false;
  loading = false;
  error = '';

  projetos: any[] = [];
  formData = {
    projeto: ''
  };

  parcelas: Parcela[] = [];
  projetoSelecionado: any = null;

  constructor(
    private projectService: ProjectService,
    private installmentService: InstallmentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser) return;

    this.projectService.getProjectsByUser(currentUser.id).subscribe(projects => {
      this.projetos = projects;
    });
  }

  gerarRelatorio(): void {
    if (!this.formData.projeto) {
      alert('Selecione um projeto.');
      return;
    }

    this.loading = true;
    this.isGenerated = true;

    const projetoId = Number(this.formData.projeto);
    this.projetoSelecionado = this.projetos.find(p => p.projectId === projetoId) || null;

    if (!this.projetoSelecionado) {
      this.error = 'Projeto não encontrado.';
      this.loading = false;
      return;
    }

    this.installmentService.getInstallmentsByProject(projetoId).subscribe({
      next: (parcelas) => {
        this.parcelas = parcelas.map(p => ({
          projeto: this.projetoSelecionado.projectName,
          name: `Parcela ${p.id}`,
          description: p.description ?? '-',
          amount: p.amount,
          status: this.mapStatus(p.paymentStatus),
          paymentMethod: p.paymentMethod ?? '-',
          estimatedPaymentDate: p.estimatedPaymentDate,
          realPaymentDate: p.realPaymentDate
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao buscar parcelas do projeto.';
        this.loading = false;
      }
    });
  }

  voltarEdicao(): void {
    this.isGenerated = false;
    this.parcelas = [];
    this.formData.projeto = '';
    this.projetoSelecionado = null;
  }

  mapStatus(status?: string): string {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'PAID': return 'Pago';
      case 'OVERDUE': return 'Em atraso';
      case 'CANCELED': return 'Cancelado';
      default: return status ?? '-';
    }
  }

  baixarPDF(): void {
    const tabela = document.getElementById('relatorioTabela');
    if (!tabela) return;

    const container = document.createElement('div');
    container.style.padding = '15px';
    container.style.backgroundColor = 'white';
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
      pdf.text(`ArchSpot - Relatório de Pagamentos por Projeto`, pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth, pdfHeight);
      pdf.save('relatorio_pagamentos_projeto.pdf');

      document.body.removeChild(container);
    });
  }
}
