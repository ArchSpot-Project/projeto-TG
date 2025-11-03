import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DirectoryService } from '../../core/services/directory.service';
import { DocumentService } from '../../core/services/document.service';
import { TableComponent } from '../../shared/table/table.component';
import { DirectoryDTO } from '../../core/models/directory.model';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css']
})
export class DirectoryComponent implements OnInit {

  @Input() projectId!: number;
  @Input() userId!: number | null;
  @Input() isCustomerInProject: boolean = false;
  @Input() directoryType: 'DOCUMENTS' | 'DRAWINGS' | string = 'DOCUMENTS';

  @Output() directoryChanged = new EventEmitter<number>(); // emite o id do diretório ativo

  directories: DirectoryDTO[] = [];
  activeTabId: number | null = null;

  contextMenu = {
    visible: false,
    x: 0,
    y: 0,
    dir: null as DirectoryDTO | null
  };

  @ViewChild(TableComponent) tableComponent!: TableComponent;

  constructor(
    private directoryService: DirectoryService,
    private documentService: DocumentService
  ) { }

  ngOnInit(): void {
    this.loadDirectories();
  }

  // ---- Diretórios ----
  loadDirectories() {
    this.directoryService.getDirectoriesByProjectAndType(this.projectId, this.directoryType)
      .subscribe({
        next: (dirs) => {
          this.directories = dirs.filter(d => d.type === 'DOCUMENTS');
          if (this.directories.length > 0) {
            this.setActiveTab(this.directories[0]);
          }
        },
        error: err => console.error('Erro ao carregar diretórios', err)
      });
  }

  setActiveTab(dir: DirectoryDTO) {
    this.activeTabId = dir.id;
    this.directoryChanged.emit(dir.id);
    this.closeContextMenu();
  }

  createDirectory() {
    const name = prompt('Digite o nome do novo diretório:');
    if (!name) return;

    const dto = { name, projectId: this.projectId, type: 'DOCUMENTS' };
    this.directoryService.createDirectoryInProject(this.projectId, dto).subscribe({
      next: (dir) => {
        this.directories.push(dir);
        this.setActiveTab(dir);
        alert('Diretório criado com sucesso!');
      },
      error: err => { console.error(err); alert('Erro ao criar diretório.'); }
    });
  }

  editDirectoryName(dir: DirectoryDTO, event: MouseEvent) {
    event.stopPropagation();
    const newName = prompt('Renomear diretório:', dir.name);
    if (!newName || newName === dir.name) return;

    this.directoryService.renameDirectory(dir.id, newName).subscribe({
      next: (updated) => { dir.name = updated.name; alert('Nome atualizado com sucesso!'); },
      error: err => { console.error(err); alert('Erro ao renomear diretório.'); }
    });
  }

  deleteDirectory(dir: DirectoryDTO) {
    this.closeContextMenu();
    if (!confirm(`Deseja excluir o diretório "${dir.name}"?`)) return;

    this.directoryService.deleteDirectory(dir.id).subscribe({
      next: () => {
        alert('Diretório excluído!');
        this.directories = this.directories.filter(d => d.id !== dir.id);
        if (this.directories.length) this.setActiveTab(this.directories[0]);
      },
      error: () => alert('Erro ao excluir diretório.')
    });
  }

  // ---- Upload ----
  uploadFile() {
    if (!this.activeTabId) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const description = prompt('Digite uma descrição para o documento:') || '';
      this.documentService.uploadDocument(this.activeTabId!, file, this.userId!, description)
        .subscribe({
          next: () => {
            alert(`Documento "${file.name}" enviado com sucesso!`);
            this.tableComponent.loadDocuments();
          },
          error: err => { console.error(err); alert('Erro ao enviar documento.'); }
        });
    };
    input.click();
  }

  // ---- Context Menu ----
  openContextMenu(event: MouseEvent, dir: DirectoryDTO) {
    event.preventDefault();
    this.contextMenu.visible = true;
    this.contextMenu.x = event.clientX;
    this.contextMenu.y = event.clientY;
    this.contextMenu.dir = dir;
  }

  closeContextMenu() {
    this.contextMenu.visible = false;
    this.contextMenu.dir = null;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeContextMenu();
  }
}
