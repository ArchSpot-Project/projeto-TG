import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DirectoryService } from '../../core/services/directory.service';
import { DocumentService } from '../../core/services/document.service';
import { TableComponent } from '../../shared/table/table.component';
import { DirectoryDTO } from '../../core/models/directory.model';
import { UserProjectService } from '../../core/services/user-project.service';

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
  @Input() projectUsers: any[] = [];
  @Output() directoryChanged = new EventEmitter<number>();

  directories: DirectoryDTO[] = [];
  activeTabId: number | null = null;

  contextMenu = {
    visible: false,
    x: 0,
    y: 0,
    dir: null as DirectoryDTO | null,
    isRoot: false
  };

  @ViewChild(TableComponent) tableComponent!: TableComponent;

  constructor(
    private directoryService: DirectoryService,
    private userProjectService: UserProjectService,
    private documentService: DocumentService
  ) { }

  ngOnInit(): void {
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: (users) => {
        this.projectUsers = users;
        this.loadDirectories();
      },
      error: err => console.error('Erro ao carregar usuários do projeto', err)
    });
  }

  loadDirectories() {
    this.directoryService.getDirectoriesByProjectAndType(this.projectId, this.directoryType)
      .subscribe({
        next: (dirs) => {
          this.directories = dirs;
          if (this.directories.length > 0) {
            this.setActiveTab(this.directories[0]);
          }
        },
        error: err => console.error('Erro ao carregar diretórios', err)
      });
  }

  createSubdirectory(parentDir: DirectoryDTO) {
    const name = prompt(`Nome do novo subdiretório dentro de "${parentDir.name}":`);
    if (!name) return;

    const dto = { name, projectId: this.projectId, type: 'DRAWINGS' };
    this.directoryService.createSubdirectory(parentDir.id, dto).subscribe({
      next: (dir) => {
        parentDir.subdirectories = parentDir.subdirectories || [];
        parentDir.subdirectories.push(dir);
        alert('Subdiretório criado com sucesso!');
        location.reload();
      },
      error: err => { console.error(err); alert('Erro ao criar subdiretório.'); }
    });
  }

  activeRoot: DirectoryDTO | null = null;

  setActiveTab(dir: DirectoryDTO) {
    this.activeTabId = dir.id;
    this.directoryChanged.emit(dir.id);

    const root = this.directories.find(d =>
      d.id === dir.id || d.subdirectories?.some(sub => sub.id === dir.id)
    );
    this.activeRoot = root || null;

    this.closeContextMenu();
  }

  createDirectory() {
    const name = prompt('Digite o nome do novo diretório raiz:');
    if (!name) return;

    const dto = { name, projectId: this.projectId, type: this.directoryType };
    this.directoryService.createDirectoryInProject(this.projectId, dto).subscribe({
      next: (dir) => {
        this.directories.push(dir);
        this.setActiveTab(dir);
        alert('Diretório criado com sucesso!');
        location.reload();
      },
      error: err => { console.error(err); alert('Erro ao criar diretório.'); }
    });
  }

  editDirectoryName(dir: DirectoryDTO, event: MouseEvent) {
    event.stopPropagation();
    const newName = prompt('Renomear diretório:', dir.name);
    if (!newName || newName === dir.name) return;

    this.directoryService.renameDirectory(dir.id, newName).subscribe({
      next: (updated) => { dir.name = updated.name; alert('Nome atualizado com sucesso!'); location.reload(); },
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
        location.reload();
      },
      error: () => alert('Erro ao excluir diretório.')
    });
  }

  getUserRole(): string | null {
    if (!this.userId || !this.projectUsers) return null;
    const user = this.projectUsers.find(u => u.userId === this.userId);
    return user?.role?.toUpperCase() || null;
  }

  isAdminInProject(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  isCollaboratorOrAssociated(): boolean {
    const role = this.getUserRole();
    return role === 'STAFF' || role === 'EXTERNAL_COLLABORATOR';
  }

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

  openContextMenu(event: MouseEvent, dir: DirectoryDTO, isRoot: boolean) {
    event.preventDefault();

    // Admin, staff e associados podem abrir o menu
    if (!(this.isAdminInProject() || this.isCollaboratorOrAssociated() ||
      (this.isCustomerInProject && this.directoryType === 'DOCUMENTS'))) {
      return;
    }

    this.contextMenu.visible = true;
    this.contextMenu.x = event.clientX;
    this.contextMenu.y = event.clientY;
    this.contextMenu.dir = dir;
    this.contextMenu.isRoot = isRoot;
  }

  closeContextMenu() {
    this.contextMenu.visible = false;
    this.contextMenu.dir = null;
  }

  shouldShowUploadButton(): boolean {
    const role = this.getUserRole();

    if (this.directoryType === 'DOCUMENTS') {
      return role === 'ADMIN' || role === 'STAFF' || role === 'EXTERNAL_COLLABORATOR' || role === 'CUSTOMER';
    }

    if (this.directoryType === 'DRAWINGS') {
      return role === 'ADMIN' || role === 'STAFF' || role === 'EXTERNAL_COLLABORATOR';
    }
    
    return false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeContextMenu();
  }
}
