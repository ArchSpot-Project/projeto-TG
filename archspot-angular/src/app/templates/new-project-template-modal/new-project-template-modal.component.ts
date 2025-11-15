import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TemplateService } from '../../core/services/template.service';
import { PhaseTemplateDTO, ProjectTemplateDTO } from '../../core/models/project-template.model';

@Component({
  selector: 'app-new-project-template-modal',
  templateUrl: './new-project-template-modal.component.html',
  styleUrls: ['./new-project-template-modal.component.css']
})
export class NewProjectTemplateModalComponent implements OnInit {
  @Input() show = false;
  @Input() editing = false;
  @Input() currentUserId!: number;
  @Input() currentUserName!: string;
  @Input() projectPhases: PhaseTemplateDTO[] = [];
  @Input() returnToProjectConfirm = false;

  @Output() close = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>(); // Volta para a modal anterior
  @Output() projectCreated = new EventEmitter<void>();
  @Output() goBackToSelect = new EventEmitter<ProjectTemplateDTO>(); // Emite template atualizado

  showNewPhaseModal = false;
  showConfirmCreateProjectModal = false;
  showConfirmCreateTemplateModal = false;

  otherPhases: PhaseTemplateDTO[] = [];

  constructor(private templateService: TemplateService) { }

  ngOnInit(): void {
    this.loadPhaseTemplates();
  }

  private loadPhaseTemplates() {
    this.templateService.getAllPhaseTemplates().subscribe(phases => {
      this.otherPhases = phases.filter(p => !this.projectPhases.find(sel => sel.id === p.id));
    });
  }

  closeModal() {
    this.close.emit();
  }

  goBackModal() {
    this.show = false;
    this.showConfirmCreateProjectModal = false;
    this.showConfirmCreateTemplateModal = false;
    this.goBack.emit();
  }

  openNewPhaseModal() {
    this.showNewPhaseModal = true;
    this.show = false;
  }

  onCloseNewPhaseModal() {
    this.showNewPhaseModal = false;
    this.show = true;
  }

  onSaveNewPhase(newPhase: PhaseTemplateDTO) {
    this.templateService.createPhaseTemplate(newPhase).subscribe(savedPhase => {
      this.projectPhases.push(savedPhase);
      this.loadPhaseTemplates();
      this.showNewPhaseModal = false;
      this.show = true;
    });
  }

  addPhaseToProject(phase: PhaseTemplateDTO) {
    this.projectPhases.push(phase);
    this.otherPhases = this.otherPhases.filter(p => p.id !== phase.id);
  }

  removePhaseFromProject(phase: PhaseTemplateDTO) {
    this.otherPhases.push(phase);
    this.projectPhases = this.projectPhases.filter(p => p.id !== phase.id);
  }

  get templatePhasesForConfirm(): { name: string; duration: number }[] {
    return this.projectPhases.map(p => ({
      name: p.name,
      duration: p.defaultDurationDays ?? 1
    }));
  }

  openConfirmCreateProject() {
    this.showConfirmCreateProjectModal = true;
  }

  onCancelConfirm() {
    this.showConfirmCreateProjectModal = false;
    this.show = true;
  }

  onProjectCreated() {
    this.showConfirmCreateProjectModal = false;
    this.show = false;
    this.projectCreated.emit();
  }

  editPhasesForProject() {
    this.returnToProjectConfirm = true;
    this.editing = true;
    this.show = true;
    this.showConfirmCreateProjectModal = false;
  }

  saveTemplate() {
    const updatedTemplate: ProjectTemplateDTO = {
      name: 'Template Temporário',
      phases: this.projectPhases,
      id: undefined,
      description: undefined,
      createdBy: undefined,
      isDefault: false
    };

    this.goBackToSelect.emit(updatedTemplate);

    this.showNewPhaseModal = false;
    this.showConfirmCreateTemplateModal = false;
    this.show = false;
    this.editing = false;
  }

  onTemplateSaved(template: ProjectTemplateDTO) {
    this.showConfirmCreateTemplateModal = false;
    this.show = false;
    this.editing = false;
    this.goBackToSelect.emit(template);
  }

  onCancelConfirmTemplate() {
    this.showConfirmCreateTemplateModal = false;
    this.show = true;
    this.editing = false;
  }
}
