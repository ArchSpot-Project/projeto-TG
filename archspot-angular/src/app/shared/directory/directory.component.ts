import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DirectoryService } from '../../core/services/directory.service';
import { DocumentService } from '../../core/services/document.service';
import { TableComponent } from '../../shared/table/table.component';
import { DirectoryDTO } from '../../core/models/directory.model';
import { UserProjectService } from '../../core/services/user-project.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css']
})
export class DirectoryComponent implements OnInit {

  @Input() projectId!: number;
  @Input() userId!: number | null;
  @Input() isCustomerInProject: boolean = false;
  @Input() directoryType: 'DOCUMENTS' | 'DRAWINGS' = 'DOCUMENTS';
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
    private documentService: DocumentService,
    private toast: ToastService
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
        this.toast.showSuccess('Subdiretório criado com sucesso!');
      },
      error: err => { console.error(err); this.toast.showError('Erro ao criar subdiretório.'); }
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
        this.toast.showSuccess('Diretório criado com sucesso!');
      },
      error: err => { console.error(err); this.toast.showError('Erro ao criar diretório.'); }
    });
  }

  editDirectoryName(dir: DirectoryDTO, event: MouseEvent) {
    event.stopPropagation();
    const newName = prompt('Renomear diretório:', dir.name);
    if (!newName || newName === dir.name) return;

    this.directoryService.renameDirectory(dir.id, newName).subscribe({
      next: (updated) => { dir.name = updated.name; this.toast.showSuccess('Nome atualizado com sucesso!'); location.reload(); },
      error: err => { console.error(err); this.toast.showError('Erro ao renomear diretório.'); }
    });
  }

  deleteDirectory(dir: DirectoryDTO) {
    this.closeContextMenu();
    if (!confirm(`Deseja excluir o diretório "${dir.name}"?`)) return;

    this.directoryService.deleteDirectory(dir.id).subscribe({
      next: () => {
        this.toast.show('Diretório excluído!');
        this.directories = this.directories.filter(d => d.id !== dir.id);
        if (this.directories.length) this.setActiveTab(this.directories[0]);
      },
      error: () => this.toast.showError('Erro ao excluir diretório.')
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

  @HostListener('document:click')
  onDocumentClick() {
    this.closeContextMenu();
  }
}
