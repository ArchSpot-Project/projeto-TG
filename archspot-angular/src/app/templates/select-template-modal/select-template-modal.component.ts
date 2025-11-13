import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-select-template-modal',
  templateUrl: './select-template-modal.component.html',
  styleUrls: ['./select-template-modal.component.css']
})
export class SelectTemplateModalComponent {
  @Input() show = false;
  @Input() currentUserId!: number;
  @Input() currentUserName!: string;

  @Output() close = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<void>();

  showNewTemplateModal = false;
  showConfirmCreateProjectModal = false;

  openNewTemplate() {
    this.show = false;
    this.showNewTemplateModal = true;
  }

  openConfirmCreateProject() {
    this.show = false;
    this.showConfirmCreateProjectModal = true;
  }

  onEditPhases() {
    this.showConfirmCreateProjectModal = false;
    this.showNewTemplateModal = true;
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
}
