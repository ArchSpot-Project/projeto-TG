import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { UserResponse } from '../../core/services/search-user.service';
import { ProjectService } from '../../core/services/project.service';
import { PhaseService } from '../../core/services/phase.service';
import { CreateProjectRequest } from '../../core/models/project.model';

interface Etapa {
  nome: string;
  duracao?: number;
}

@Component({
  selector: 'app-confirm-create-new-project-modal',
  templateUrl: './confirm-create-new-project.component.html',
  styleUrls: ['./confirm-create-new-project.component.css']
})
export class ConfirmCreateNewProjectModalComponent implements OnChanges {
  @Input() show = false;
  @Input() templateId?: number;
  @Input() templatePhases?: { name: string; duration: number }[];
  @Input() templateName: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() editPhases = new EventEmitter<Etapa[]>();
  @Output() goBack = new EventEmitter<void>();

  projectName = '';
  projectDescription = '';
  estimatedStartDate = '';

  etapas: Etapa[] = [];
  etapasSelecionadas: string[] = [];

  roles: string[] = ['STAFF', 'CUSTOMER', 'EXTERNAL_COLLABORATOR'];
  showAddModal = false;
  users: { id: number; name: string; role: string }[] = [];

  constructor(
    private projectService: ProjectService,
    private phaseService: PhaseService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['templatePhases'] && this.templatePhases) {
      this.etapas = this.templatePhases.map(p => ({
        nome: p.name,
        duracao: p.duration
      }));
      this.etapasSelecionadas = this.etapas.map(e => e.nome);
    }
  }

  onGoBack() {
    this.goBack.emit();
  }

  toggleEtapa(nome: string) {
    if (this.etapasSelecionadas.includes(nome)) {
      this.etapasSelecionadas = this.etapasSelecionadas.filter(x => x !== nome);
    } else {
      this.etapasSelecionadas.push(nome);
    }
  }

  isSelected(nome: string) {
    return this.etapasSelecionadas.includes(nome);
  }

  openAddUserModal() { this.showAddModal = true; }
  cancelAdd() { this.showAddModal = false; }

  handleAddUser(data: { user: UserResponse; role: string }) {
    const obj = { id: data.user.id, name: data.user.name, role: data.role };
    if (!this.users.find(u => u.id === obj.id)) this.users.push(obj);
  }

  removeUser(id: number) {
    this.users = this.users.filter(u => u.id !== id);
  }

  createProject() {
    if (!this.projectName.trim()) {
      alert("Digite um nome para o projeto.");
      return;
    }
    if (!this.estimatedStartDate) {
      alert("Selecione a data de início estimada.");
      return;
    }

    const etapasSelecionadas = this.etapas.filter(
      e => this.etapasSelecionadas.includes(e.nome)
    );

    if (etapasSelecionadas.length === 0) {
      alert("Selecione pelo menos uma etapa.");
      return;
    }

    const payload: CreateProjectRequest = {
      name: this.projectName,
      description: this.projectDescription,
      estimatedStartDate: this.estimatedStartDate,
      templateId: this.templateId
    } as any;

    this.projectService.createProject(payload).subscribe({
      next: project => {
        const projectId = project.id;

        this.users.forEach(u =>
          this.projectService.assignUserToProject(projectId, u.id, u.role).subscribe()
        );
        this.createPhasesSequentially(projectId, etapasSelecionadas);

      },
      error: err => {
        console.error(err);
        alert("Erro ao criar projeto.");
      }
    });
  }

  private createPhasesSequentially(projectId: number, etapas: Etapa[]) {
    let current = new Date(this.estimatedStartDate);
    let lastPhaseId: number | null = null;

    const createNext = (index: number) => {
      if (index >= etapas.length) {
        this.created.emit();
        return;
      }

      const etapa = etapas[index];

      const start = new Date(current);
      const end = new Date(start);
      end.setDate(start.getDate() + (etapa.duracao ?? 1));

      const phaseBody = {
        name: etapa.nome,
        description: '',
        estimatedStartDate: start.toISOString().split("T")[0],
        estimatedEndDate: end.toISOString().split("T")[0],
        previousPhaseId: lastPhaseId
      };

      this.phaseService.createPhase(projectId, phaseBody).subscribe({
        next: createdPhase => {
          lastPhaseId = createdPhase.id;
          current = new Date(end);
          current.setDate(current.getDate() + 1);

          createNext(index + 1);
        },
        error: err => {
          console.error("Erro ao criar fase:", etapa.nome, err);
        }
      });
    };

    createNext(0);
  }

  onCancel() {
    this.goBack.emit();
  }
}
