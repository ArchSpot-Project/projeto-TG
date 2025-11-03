import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DirectoryDTO } from '../../../core/models/directory.model';

@Component({
  selector: 'app-directory-node',
  template: `
  <div class="ms-3 mt-2">
    <button class="btn btn-sm"
      [class.btn-primary]="directory.id === activeTabId"
      [class.btn-light]="directory.id !== activeTabId"
      (click)="selectDirectory()">
      {{ directory.name }}
    </button>

    <!-- botão criação de subdir -->
    <button
      *ngIf="!isCustomerInProject"
      class="btn btn-link btn-sm text-success p-0 ms-1"
      (click)="addSubdirectory($event)">
      + Subdir
    </button>

    <!-- subdiretórios (recursão) -->
    <div *ngIf="directory.subdirectories?.length">
      <app-directory-node
        *ngFor="let sub of directory.subdirectories"
        [directory]="sub"
        [activeTabId]="activeTabId"
        [isCustomerInProject]="isCustomerInProject"
        (directorySelected)="directorySelected.emit($event)"
        (createSubdirectory)="createSubdirectory.emit($event)">
      </app-directory-node>
    </div>
  </div>
  `,
  styles: [`
    .btn-sm { font-size: 0.9rem; }
    .btn-link { text-decoration: none; }
  `]
})
export class DirectoryNodeComponent {
  @Input() directory!: DirectoryDTO;
  @Input() activeTabId!: number | null;
  @Input() isCustomerInProject = false;

  @Output() directorySelected = new EventEmitter<DirectoryDTO>();
  @Output() createSubdirectory = new EventEmitter<DirectoryDTO>();

  selectDirectory() {
    this.directorySelected.emit(this.directory);
  }

  addSubdirectory(event: MouseEvent) {
    event.stopPropagation();
    this.createSubdirectory.emit(this.directory);
  }
}
