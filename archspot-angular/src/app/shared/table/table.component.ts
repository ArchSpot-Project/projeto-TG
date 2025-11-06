import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DocumentService } from '../../core/services/document.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProjectService } from '../../core/services/user-project.service';
import { DocumentDTO } from '../../core/models/document.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {
  @Input() title = '';
  @Input() directoryId!: number;
  @Input() directoryType: 'DOCUMENTS' | 'DRAWINGS' = 'DOCUMENTS';
  @Input() projectId!: number;

  documents: DocumentDTO[] = [];
  userCache: { [id: number]: string } = {};
  userRole: string | null = null;
  userId: number | null = null;
  projectUsers: any[] = [];

  constructor(
    private documentService: DocumentService,
    private userProjectService: UserProjectService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;
    this.userRole = currentUser?.userRole || null;

    if (this.projectId) {
      this.loadProjectUsers();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['directoryId'] && this.directoryId) {
      this.loadDocuments();
    }
  }

  loadProjectUsers(): void {
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: (users) => (this.projectUsers = users),
      error: (err) => console.error('Erro ao carregar usuários do projeto', err)
    });
  }

  get currentUserRoleInProject(): string {
    const user = this.projectUsers.find((u) => u.userId === this.userId);
    return user?.role?.toUpperCase() || this.userRole?.toUpperCase() || '';
  }

  isOwner(doc: DocumentDTO): boolean {
    return doc.uploadedById === this.userId;
  }

  canEdit(doc: DocumentDTO): boolean {
    const role = this.currentUserRoleInProject;

    if (['ADMIN', 'STAFF'].includes(role)) {
      return true;
    }

    //regras diferentes de drawings para documents
    if (this.directoryType === 'DRAWINGS') {
      if (role === 'EXTERNAL_COLLABORATOR') {
        return this.isOwner(doc);
      }
      if (role === 'CUSTOMER') {
        return false;
      }
    }

    if (this.directoryType === 'DOCUMENTS') {
      if (['EXTERNAL_COLLABORATOR', 'CUSTOMER'].includes(role)) {
        return this.isOwner(doc);
      }
    }

    return false;
  }

  canDelete(doc: DocumentDTO): boolean {
    const role = this.currentUserRoleInProject;

    if (['ADMIN', 'STAFF'].includes(role)) {
      return true;
    }

    if (this.directoryType === 'DRAWINGS') {
      if (role === 'EXTERNAL_COLLABORATOR') {
        return this.isOwner(doc);
      }
      if (role === 'CUSTOMER') {
        return false;
      }
    }

    if (this.directoryType === 'DOCUMENTS') {
      if (['EXTERNAL_COLLABORATOR', 'CUSTOMER'].includes(role)) {
        return this.isOwner(doc);
      }
    }

    return false;
  }

  getDisplayName(name: string): string {
    return name.replace(/\.[^/.]+$/, '');
  }

  getUploaderName(id: number): string {
    return this.userCache[id] || 'Carregando...';
  }

  loadDocuments(): void {
    this.documentService.getDocumentsByDirectory(this.directoryId).subscribe({
      next: (docs) => {
        this.documents = docs;
        docs.forEach((doc) => {
          this.userService.getUserById(doc.uploadedById).subscribe({
            next: (user) => (this.userCache[doc.uploadedById] = user.name),
            error: () =>
              (this.userCache[doc.uploadedById] = `Usuário ${doc.uploadedById}`)
          });
        });
      },
      error: (err) => console.error('Erro ao carregar documentos', err)
    });
  }

  abrirDoc(doc: DocumentDTO): void {
    const path =
      this.directoryType === 'DRAWINGS'
        ? 'drawings'
        : 'documents';
    this.router.navigate([`/projects/${this.projectId}/${path}/${doc.id}/view`]);
  }

  downloadDoc(doc: DocumentDTO): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = this.getDisplayName(doc.name);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Erro ao baixar o documento.')
    });
  }

  substituirDoc(doc: DocumentDTO): void {
    if (!this.canEdit(doc)) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = (event: any) => {
      const file: File = event.target.files[0];
      if (!file) return;

      const description = prompt('Descrição da nova versão:', doc.description) ?? '';

      this.documentService.uploadNewVersion(doc.id, file, description).subscribe({
        next: () => {
          alert('Nova versão enviada com sucesso!');
          this.loadDocuments();
        },
        error: (err) => {
          console.error('Erro ao substituir documento:', err);
          alert('Erro ao enviar nova versão.');
        }
      });
    };
    input.click();
  }

  renomearDoc(doc: DocumentDTO): void {
    if (!this.canEdit(doc)) return;

    const newName = prompt('Digite o novo nome', this.getDisplayName(doc.name));
    if (!newName || newName === this.getDisplayName(doc.name)) return;

    this.documentService.updateDocument(doc.id, { ...doc, name: newName }).subscribe({
      next: () => {
        alert('Documento renomeado com sucesso!');
        this.loadDocuments();
      },
      error: () => alert('Erro ao renomear documento.')
    });
  }

  deletarDoc(doc: DocumentDTO): void {
    if (!this.canDelete(doc)) return;
    if (!confirm(`Deseja realmente deletar ${doc.name}?`)) return;

    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.documents = this.documents.filter((d) => d.id !== doc.id);
        alert('Documento deletado com sucesso!');
      },
      error: () => alert('Erro ao deletar documento.')
    });
  }
}
