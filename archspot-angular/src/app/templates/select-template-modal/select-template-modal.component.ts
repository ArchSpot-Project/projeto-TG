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
      next: templates => {
        const userId = this.currentUserId;

        const filtered = templates.filter((t, index, self) => {
          if (!t.isDefault) return true;
          const cloneExists = self.some(other => !other.isDefault && other.name === t.name && other.createdBy === userId);
          return !cloneExists;
        });

        this.projectTemplates = filtered;
      },
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

  handleGoBack() {
    this.showConfirmCreateProjectModal = false;
    this.show = true;
    this.showNewTemplateModal = false;
    this.returnToProjectConfirm = false;
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
    this.projectTemplates.push(savedTemplate);
    this.selectedTemplate = savedTemplate;
    this.selectedTemplatePhases = savedTemplate.phases?.map(p => ({
      name: p.name,
      duration: p.defaultDurationDays ?? 1
    })) || [];

    this.show = true;
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
