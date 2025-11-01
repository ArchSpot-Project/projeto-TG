import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/services/project.service';
import { PhaseService } from '../../../core/services/phase.service';
import { AuthService } from '../../../core/services/auth.service';
import { PhaseWithProject } from '../../../core/models/phase.model';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-report-cronograma-projeto',
  templateUrl: './report-cronograma-projeto.component.html',
  styleUrls: ['./report-cronograma-projeto.component.css']
})
export class ReportCronogramaProjetoComponent implements OnInit {
  isGenerated = false;
  loading = false;
  error = '';
  phases: PhaseWithProject[] = [];
  projetos: any[] = [];
  projetoSelecionado: any = null;

  formData = {
    projeto: ''
  };

  constructor(
    private projectService: ProjectService,
    private phaseService: PhaseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser) return;

    // pega todos os projetos do usuário
    this.projectService.getProjectsByUser(currentUser.id).subscribe(projects => {
      this.projetos = projects;
    });
  }

  gerarRelatorio(): void {
    this.error = '';
    if (!this.formData.projeto) {
      alert('Selecione um projeto.');
      return;
    }

    this.loading = true;
    this.isGenerated = true;

    const projetoIdSelecionado = Number(this.formData.projeto);
    this.projetoSelecionado = this.projetos.find(p => p.projectId === projetoIdSelecionado) || null;

    if (!this.projetoSelecionado) {
      this.error = 'Projeto não encontrado.';
      this.loading = false;
      return;
    }

    this.phaseService.getPhasesByProjectId(this.projetoSelecionado.projectId).subscribe({
      next: (phases) => {
        this.phases = phases.map(p => ({ ...p }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao buscar fases do projeto.';
        this.loading = false;
      }
    });
  }

  voltarEdicao(): void {
    this.isGenerated = false;
    this.phases = [];
    this.projetoSelecionado = null;
    this.formData.projeto = '';
  }

  mapStatus(status?: string): string {
    switch (status) {
      case 'OVERDUE': return 'Atrasado';
      case 'IN_PROGRESS': return 'Em andamento';
      case 'COMPLETED': return 'Concluído';
      case 'CANCELLED': return 'Cancelado';
      default: return status ?? '-';
    }
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
      pdf.text('ArchSpot - Relatório de Cronograma por Projeto', pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth, pdfHeight);
      pdf.save('relatorio_cronograma_projeto.pdf');

      document.body.removeChild(container);
    });
  }
}
