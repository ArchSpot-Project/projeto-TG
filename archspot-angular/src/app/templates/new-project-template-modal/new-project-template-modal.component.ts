import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-new-project-template-modal',
  templateUrl: './new-project-template-modal.component.html',
  styleUrls: ['./new-project-template-modal.component.css']
})
export class NewProjectTemplateModalComponent {
  @Input() show = false;
  @Input() currentUserId!: number;
  @Input() currentUserName!: string;

  @Output() close = new EventEmitter<void>();
  @Output() goBackToSelect = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<void>();

  showConfirmCreateProjectModal = false;
  showConfirmCreateTemplateModal = false;

  closeModal() {
    this.close.emit();
  }

  saveTemplate() {
    // Abre a modal de confirmação de template e oculta esta
    this.show = false;
    this.showConfirmCreateTemplateModal = true;
  }

  goBack() {
    this.goBackToSelect.emit();
  }

  openConfirmCreateProject() {
    this.showConfirmCreateProjectModal = true;
  }

  onCancelConfirm() {
    this.showConfirmCreateProjectModal = false;
  }

  onProjectCreated() {
    this.showConfirmCreateProjectModal = false;
    this.show = false;
    this.projectCreated.emit();
  }

  onEditPhases() {
    this.showConfirmCreateProjectModal = false; // fecha a modal de criar projeto
    this.show = true; // abre a modal de novo template
  }

  showNewPhaseModal = false;
  phases: { name: string; duration: number }[] = [];

  openNewPhaseModal() {
    this.showNewPhaseModal = true;
    this.show = false;
  }

  onCloseNewPhaseModal() {
    this.showNewPhaseModal = false;
    this.show = true;
  }

  onSaveNewPhase(newPhase: { name: string; duration: number }) {
    this.phases.push(newPhase);
    this.showNewPhaseModal = false;
  }

  // 🔹 Novo: controle da modal de confirmação de template
  onCancelConfirmTemplate() {
    this.showConfirmCreateTemplateModal = false;
    this.show = true;
  }

  onTemplateSaved() {
    this.showConfirmCreateTemplateModal = false;
    this.show = false;
    this.goBackToSelect.emit();
  }
}
