import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TemplateService } from '../../core/services/template.service';
import { PhaseTemplateDTO, ProjectTemplateDTO } from '../../core/models/project-template.model';

interface Etapa {
  nome: string;
  duracao?: number;
}

@Component({
  selector: 'app-select-template-modal',
  templateUrl: './select-template-modal.component.html',
  styleUrls: ['./select-template-modal.component.css']
})
export class SelectTemplateModalComponent implements OnInit {
  @Input() show = false;
  @Input() currentUserId!: number;
  @Input() currentUserName!: string;
  @Output() close = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<void>();

  editing = false;
  projectPhases: PhaseTemplateDTO[] = [];
  projectTemplates: ProjectTemplateDTO[] = [];
  selectedTemplate?: ProjectTemplateDTO;
  selectedTemplatePhases: { name: string; duration: number }[] = [];
  returnToProjectConfirm = false;

  showNewTemplateModal = false;
  showConfirmCreateProjectModal = false;

  constructor(private templateService: TemplateService) { }

  ngOnInit(): void {
    this.loadProjectTemplates();
  }

  private loadProjectTemplates() {
    this.templateService.getProjectTemplates().subscribe({
      next: templates => this.projectTemplates = templates,
      error: err => console.error('Erro ao carregar templates:', err)
    });
  }

  openNewTemplate(existingPhases?: { nome: string; duracao?: number }[]) {
    this.show = false;
    this.showNewTemplateModal = true;
    this.editing = false;

    if (existingPhases) {
      this.projectPhases = existingPhases.map(p => ({
        name: p.nome,
        defaultDurationDays: p.duracao
      }));
    }
  }

  selectTemplate(template: ProjectTemplateDTO) {
    this.selectedTemplate = template;
    this.selectedTemplatePhases = template.phases?.map(p => ({
      name: p.name,
      duration: p.defaultDurationDays ?? 1
    })) || [];

    this.showConfirmCreateProjectModal = true;
    this.show = false;
  }

  editPhases(etapas: Etapa[]) {
    this.projectPhases = etapas.map(e => ({
      name: e.nome,
      defaultDurationDays: e.duracao
    }));

    this.editing = true;
    this.showNewTemplateModal = true;
    this.showConfirmCreateProjectModal = false;
    this.returnToProjectConfirm = true;
  }

  /** Chamado pelo filho ao clicar em "Voltar" */
  handleGoBack() {
    if (this.returnToProjectConfirm) {
      // Volta para a confirmação de projeto
      this.showConfirmCreateProjectModal = true;
    } else {
      // Volta para a tela de seleção
      this.show = true;
    }
    this.showNewTemplateModal = false;
  }

  onCancelConfirm() {
    this.showConfirmCreateProjectModal = false;
    this.show = true;
  }

  onProjectCreated() {
    this.resetModal();
    this.projectCreated.emit();
  }

  onNewTemplateSaved(savedTemplate: ProjectTemplateDTO) {
    this.showNewTemplateModal = false;

    this.selectedTemplatePhases = savedTemplate.phases?.map(p => ({
      name: p.name,
      duration: p.defaultDurationDays ?? 1
    })) || [];

    this.showConfirmCreateProjectModal = true;
    this.editing = false;
  }

  private resetModal() {
    this.show = false;
    this.showNewTemplateModal = false;
    this.showConfirmCreateProjectModal = false;
    this.editing = false;
    this.returnToProjectConfirm = false;
    this.selectedTemplate = undefined;
    this.projectPhases = [];
    this.selectedTemplatePhases = [];
  }
}
