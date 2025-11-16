import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TemplateService } from '../../core/services/template.service';
import { PhaseTemplateDTO, ProjectTemplateDTO } from '../../core/models/project-template.model';

@Component({
  selector: 'app-confirm-create-new-template-modal',
  templateUrl: './confirm-create-new-template-modal.component.html',
  styleUrls: ['./confirm-create-new-template-modal.component.css']
})
export class ConfirmCreateNewTemplateModalComponent {
  @Input() show = false;
  @Input() selectedPhases: PhaseTemplateDTO[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ProjectTemplateDTO>();

  templateName = '';
  saving = false;

  constructor(private templateService: TemplateService) { }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    if (!this.templateName.trim()) {
      alert('Por favor, insira um nome para o template.');
      return;
    }

    this.saving = true;

    const template: ProjectTemplateDTO = {
      name: this.templateName.trim(),
      description: undefined,
      phases: this.selectedPhases,
      createdBy: undefined,
      isDefault: false,
      id: undefined
    };

    this.templateService.createProjectTemplate(template).subscribe({
      next: savedTemplate => {
        this.saved.emit(savedTemplate); // Retorna o template salvo para o NewProjectTemplateModal
      },
      error: err => {
        console.error('Erro ao salvar template', err);
        this.saving = false;
      }
    });
  }
}
