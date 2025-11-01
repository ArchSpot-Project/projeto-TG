import { Component } from '@angular/core';
import { PhaseService } from '../../../core/services/phase.service';
import { PhaseWithProject } from '../../../core/models/phase.model';
import { forkJoin, map, switchMap, of } from 'rxjs';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-report-cronograma-geral',
  templateUrl: './report-cronograma-geral.component.html',
  styleUrls: ['./report-cronograma-geral.component.css']
})
export class ReportCronogramaGeralComponent {
  isGenerated = false;
  loading = false;
  error = '';
  dataInvalida = false;
  phases: PhaseWithProject[] = [];

  formData = {
    periodoInicio: '',
    periodoFim: '',
    status: 'todos',
  };

  constructor(
    private phaseService: PhaseService,
    private projectService: ProjectService,
    private authService: AuthService
  ) { }

  gerarRelatorio(): void {
    this.error = '';
    this.dataInvalida = false;

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
    console.log('Botão gerar relatório clicado');

    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.error = 'Usuário não está logado.';
      this.loading = false;
      return;
    }

    const userId = currentUser.id;

    this.projectService.getProjectsByUser(userId).pipe(
      switchMap(userProjects => {
        console.log('Projetos do usuário:', userProjects);

        if (!userProjects || userProjects.length === 0) {
          this.error = 'Nenhum projeto encontrado para este usuário.';
          this.loading = false;
          return of([]);
        }

        const detailedRequests = userProjects.map(up =>
          this.projectService.getProjectById(up.projectId).pipe(
            switchMap(project =>
              this.phaseService.getPhasesByProjectId(project.id).pipe(
                map(phases =>
                  phases.map(phase => ({
                    ...phase,
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
        const merged = all.flat();
        console.log('Fases recebidas:', merged);

        let filtered = merged.filter(p => p.id);

        if (this.formData.status !== 'todos') {
          filtered = filtered.filter(p => p.status === this.formData.status);
        }

        const startDate = this.formData.periodoInicio ? new Date(this.formData.periodoInicio) : null;
        const endDate = this.formData.periodoFim ? new Date(this.formData.periodoFim) : null;

        if (startDate)
          filtered = filtered.filter(p => new Date(p.estimatedStartDate) >= startDate);
        if (endDate)
          filtered = filtered.filter(p => new Date(p.estimatedEndDate) <= endDate);

        this.phases = filtered.map(p => ({
          ...p,
          status: this.mapStatus(p.status),
          projectStatus: this.mapStatus(p.projectStatus)
        }));

        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar fases:', err);
        this.error = 'Erro ao buscar fases dos projetos.';
        this.loading = false;
      }
    });
  }

  voltarEdicao(): void {
    this.isGenerated = false;
    this.phases = [];
  }

  limparFiltros(): void {
    this.formData = {
      periodoInicio: '',
      periodoFim: '',
      status: '',
    };
    this.error = '';
    this.dataInvalida = false;
  }

  baixarPDF(): void {
    const tabela = document.getElementById('relatorioTabela');
    if (!tabela) return;

    // cria um container temporário invisível para fazer um clone da tabela e mostrar num pdf
    const container = document.createElement('div');
    container.style.padding = '15px';
    container.style.backgroundColor = 'white';
    container.style.display = 'inline-block';
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.appendChild(tabela.cloneNode(true));

    document.body.appendChild(container); //container temporario para printar a tela

    html2canvas(container, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // título do pdf
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ArchSpot - Relatório de Cronograma Geral', pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      // imagem da tabela
      pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth, pdfHeight);
      pdf.save('relatorio_cronograma_geral.pdf');

      // Remove container temporário
      document.body.removeChild(container);
    });
  }

  private mapStatus(status?: string): string {
    switch (status) {
      case 'OVERDUE': return 'Atrasado';
      case 'IN_PROGRESS': return 'Em andamento';
      case 'COMPLETED': return 'Concluído';
      case 'CANCELLED': return 'Cancelado';
      default: return status ?? '-';
    }
  }
}
