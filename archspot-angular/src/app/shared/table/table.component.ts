import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DocumentService } from '../../core/services/document.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProjectService } from '../../core/services/user-project.service';
import { DocumentDTO } from '../../core/models/document.model';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

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
  @Input() activeRootId?: number;

  documents: DocumentDTO[] = [];
  userCache: { [id: number]: string } = {};
  userRole: string | null = null;
  userId: number | null = null;
  projectUsers: any[] = [];
  showVersioningModal = false;
  selectedDocumentId: number | null = null;
  selectedDocumentName: string | null = null;

  constructor(
    private documentService: DocumentService,
    private userProjectService: UserProjectService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;

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

  getDisplayName(name: string | null | undefined): string {
    if (!name) return 'Sem nome';
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
    const path = this.directoryType === 'DRAWINGS' ? 'drawings' : 'documents';
    this.router.navigate([`/projects/${this.projectId}/${path}/${doc.id}/view`]);
  }

  abrirVersionamento(doc: DocumentDTO) {
    this.selectedDocumentId = doc.id;
    this.selectedDocumentName = doc.name;
    this.showVersioningModal = true;
  }

  cancelModal(): void {
    this.showVersioningModal = false;
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
      error: () => this.toast.showError('Erro ao baixar o documento.')
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

      const description = prompt('Descrição da nova versão:', doc.description || '') ?? '';

      const ext = doc.name && doc.name.includes('.') ? doc.name.slice(doc.name.lastIndexOf('.')) : '';
      let baseName = doc.name ?? '';
      if (ext) baseName = baseName.slice(0, baseName.length - ext.length);

      baseName = baseName.replace(/\s*\(\s*\d+\s*\)\s*$/, '');

      let currentVersion = 1;
      const matchCurrent = doc.name?.match(/\((\d+)\)/);
      if (matchCurrent) currentVersion = Number(matchCurrent[1]);

      this.documentService.getDocumentVersions(doc.id).subscribe({
        next: (versions) => {
          let extracted = [currentVersion];

          versions.forEach(v => {
            const num = Number((v as any).versionNumber);
            if (!isNaN(num) && num > 0) extracted.push(num);

            const nameCandidate = (v as any).name || (v as any).fileUrl || '';
            const m = nameCandidate.match(/\((\d+)\)/);
            if (m) extracted.push(Number(m[1]));
          });

          const maxVersion = Math.max(...extracted);
          const nextVersion = maxVersion + 1;

          const newFileName = `${baseName} (${nextVersion})${ext}`;

          this.documentService.uploadNewVersion(doc.id, file, description).subscribe({
            next: () => {

              this.documentService.updateDocument(doc.id, {
                ...doc,
                name: newFileName,
                description: description
              }).subscribe({
                next: () => {
                  alert(`Nova versão "${newFileName}" enviada com sucesso!`);
                  this.loadDocuments();
                },
                error: () => this.toast.showError('Erro ao renomear nova versão.')
              });
            },
            error: () => this.toast.showError('Erro ao enviar nova versão.')
          });
        },
        error: () => this.toast.showError('Erro ao carregar versões para gerar novo nome.')
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
      error: () => this.toast.showError('Erro ao renomear documento.')
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
      error: () => this.toast.showError('Erro ao deletar documento.')
    });
  }

  uploadFile() {
    if (!this.directoryId || !this.userId) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const description = prompt('Digite uma descrição para o documento:') || '';
      this.documentService.uploadDocument(this.directoryId, file, this.userId!, description)
        .subscribe({
          next: () => {
            this.toast.showSuccess(`Documento "${file.name}" enviado com sucesso!`);
            this.loadDocuments();
          },
          error: (err) => {
            console.error(err);
            this.toast.showError('Erro ao enviar documento.');
          }
        });
    };
    input.click();
  }

  shouldShowUploadButton(): boolean {
    const role = this.currentUserRoleInProject;
    if (!role || !this.directoryId) return false;

    if (this.directoryType === 'DOCUMENTS') {
      return ['ADMIN', 'STAFF', 'EXTERNAL_COLLABORATOR', 'CUSTOMER'].includes(role);
    }

    if (this.directoryType === 'DRAWINGS') {
      // não permitir upload na raiz
      const isRoot = this.activeRootId === this.directoryId;
      return ['ADMIN', 'STAFF', 'EXTERNAL_COLLABORATOR'].includes(role) && !isRoot;
    }

    return false;
  }
}
