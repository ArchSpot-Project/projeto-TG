import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { DirectoryDTO, DirectoryService } from '../core/services/directory.service';
import { ActivatedRoute } from '@angular/router';
import { TableComponent } from '../shared/table/table.component';
import { AuthService } from '../core/services/auth.service';
import { UserProjectService } from '../core/services/user-project.service';
import { DocumentService } from '../core/services/document.service';
import { ProjectService } from '../core/services/project.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {

  directories: DirectoryDTO[] = [];
  activeTabId: number | null = null;
  projectId!: number;
  userId: number | null = null;
  projectUsers: any[] = [];
  projectName: string = '';

  contextMenu = {
    visible: false,
    x: 0,
    y: 0,
    dir: null as DirectoryDTO | null
  };

  @ViewChild(TableComponent) tableComponent!: TableComponent;

  constructor(
    private route: ActivatedRoute,
    private userProjectService: UserProjectService,
    private directoryService: DirectoryService,
    private documentService: DocumentService,
    private authService: AuthService,
    private projectService: ProjectService
  ) { }

  get isCustomerInProject(): boolean {
    if (!this.userId) return true;
    const user = this.projectUsers.find(u => u.userId === this.userId);
    return user?.role === 'CUSTOMER';
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = +params['id'];
      this.loadProjectUsers();
      this.loadDirectories();
      this.loadProjectName();
    });

    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;
  }

  loadProjectName() {
  this.projectService.getProjectById(this.projectId).subscribe({
    next: (proj) => this.projectName = proj.name,
    error: (err) => console.error('Erro ao carregar projeto', err)
  });
}

  loadProjectUsers(): void {
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: users => this.projectUsers = users,
      error: err => console.error('Erro ao carregar usuários do projeto', err)
    });
  }

  loadDirectories() {
    this.directoryService.getDirectoriesByProjectAndType(this.projectId, 'DOCUMENTS')
      .subscribe({
        next: (dirs) => {
          this.directories = dirs.filter(dir => dir.type === 'DOCUMENTS');
          if (this.directories.length > 0) {
            this.setActiveTab(this.directories[0]);
          }
        },
        error: (err) => console.error('Erro ao carregar diretórios', err)
      });
  }

  setActiveTab(dir: DirectoryDTO) {
    this.activeTabId = dir.id;
    this.closeContextMenu();
  }

  createDirectory() {
    const name = prompt('Digite o nome do novo diretório:');
    if (!name) return;

    const dto = { name, projectId: this.projectId, type: 'DOCUMENTS' };
    this.directoryService.createDirectoryInProject(this.projectId, dto).subscribe({
      next: (dir) => {
        this.directories.push(dir);
        this.setActiveTab(dir); // ativa automaticamente o novo diretório
        alert('Diretório criado com sucesso!');
      },
      error: (err) => { console.error(err); alert('Erro ao criar diretório.'); }
    });
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
            this.tableComponent.loadDocuments(); // recarrega documentos do diretório ativo
          },
          error: (err) => {
            console.error(err);
            alert('Erro ao enviar documento.');
          }
        });
    };
    input.click();
  }

  editDirectoryName(dir: DirectoryDTO, event: MouseEvent) {
    event.stopPropagation();
    const newName = prompt('Renomear diretório:', dir.name);
    if (!newName || newName === dir.name) return;

    this.directoryService.renameDirectory(dir.id, newName).subscribe({
      next: (updated) => { dir.name = updated.name; alert('Nome atualizado com sucesso!'); },
      error: (err) => { console.error(err); alert('Erro ao renomear diretório.'); }
    });
  }

  // ---- Context Menu ----
  openContextMenu(event: MouseEvent, dir: DirectoryDTO) {
    event.preventDefault();
    this.contextMenu.visible = true;
    this.contextMenu.x = event.clientX;
    this.contextMenu.y = event.clientY;
    this.contextMenu.dir = dir;
  }

  openContextMenuAbove(event: MouseEvent, dir: DirectoryDTO) {
    event.preventDefault();
    this.contextMenu.visible = true;
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

  deleteDirectory(dir: DirectoryDTO) {
    this.closeContextMenu();
    if (!confirm(`Deseja excluir o diretório "${dir.name}"?`)) return;

    this.directoryService.deleteDirectory(dir.id).subscribe({
      next: () => {
        alert('Diretório excluído!');
        location.reload(); // recarrega a página inteira
      },
      error: () => alert('Erro ao excluir diretório.')
    });
  }

  @HostListener('document:click')
  handleClick() {
    if (this.contextMenu.visible) this.closeContextMenu();
  }
}
