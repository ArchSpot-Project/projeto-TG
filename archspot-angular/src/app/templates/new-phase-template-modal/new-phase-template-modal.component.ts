import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-new-phase-template-modal',
  templateUrl: './new-phase-template-modal.component.html',
  styleUrls: ['./new-phase-template-modal.component.css']
})
export class NewPhaseTemplateModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ name: string; duration: number }>();

  phaseName = '';
  phaseDuration: number | null = null;

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (!this.phaseName.trim() || !this.phaseDuration) return;
    this.save.emit({ name: this.phaseName.trim(), duration: this.phaseDuration });
    this.onClose();
  }
}
