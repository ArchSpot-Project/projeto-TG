import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-create-new-template-modal',
  templateUrl: './confirm-create-new-template-modal.component.html',
  styleUrls: ['./confirm-create-new-template-modal.component.css']
})
export class ConfirmCreateNewTemplateModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  templateName = '';

  onCancel() {
    this.close.emit();
  }

  onSave() {
    if (!this.templateName.trim()) {
      alert('Por favor, insira um nome para o template.');
      return;
    }
    console.log('Template salvo:', this.templateName);
    this.saved.emit();
  }
}
