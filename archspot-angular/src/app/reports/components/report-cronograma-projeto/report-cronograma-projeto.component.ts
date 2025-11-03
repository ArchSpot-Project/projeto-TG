import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../core/services/project.service';
import { PhaseService } from '../../../core/services/phase.service';
import { AuthService } from '../../../core/services/auth.service';
import { PhaseWithProject } from '../../../core/models/phase.model';

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
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser) return;

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
        this.phases = phases.map(p => ({
          ...p,
          projectName: this.projetoSelecionado.projectName,
          status: this.mapStatus(p.status)
        }));
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
      case 'NOT_STARTED': return 'Não iniciada';
      default: return status ?? '-';
    }
  }
}
