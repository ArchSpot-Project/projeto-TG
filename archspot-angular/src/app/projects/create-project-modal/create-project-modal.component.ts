import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-create-project-modal',
  templateUrl: './create-project-modal.component.html',
  styleUrl: './create-project-modal.component.css'
})

export class CreateProjectModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  cancel(): void {
    this.show = false;
    this.close.emit();
  }


}
