import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DocumentService } from '../../core/services/document.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { UserProjectService } from '../../core/services/user-project.service';
import { DocumentDTO } from '../../core/models/document.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {
  @Input() title = '';
  @Input() directoryId!: number;

  documents: DocumentDTO[] = [];
  userCache: { [id: number]: string } = {};
  @Input() projectId!: number;
  userRole: string | null = null;
  userId: number | null = null;
  projectUsers: any[] = [];

  constructor(
    private documentService: DocumentService,
    private userProjectService: UserProjectService,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;
    this.userRole = currentUser?.userRole || null;

    if (this.projectId) {
      this.loadProjectUsers();
    }
  }

  loadProjectUsers(): void {
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: users => this.projectUsers = users,
      error: err => console.error('Erro ao carregar usuários do projeto', err)
    });
  }

  get isCustomerInProject(): boolean {
    if (!this.userId) return false;
    const user = this.projectUsers.find(u => u.userId === this.userId);
    return user?.role === 'CUSTOMER';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['directoryId'] && this.directoryId) {
      this.loadDocuments();
    }
  }

  getDisplayName(name: string): string {
    return name.replace(/\.[^/.]+$/, '');
  }

  abrirDoc(doc: DocumentDTO) { //em implementação
    const url = `http://localhost:8080/documents/${doc.id}/view`;
    window.open(url, '_blank');
  }

  loadDocuments() {
    if (!this.directoryId) {
      this.documents = [];
      return;
    }

    this.documentService.getDocumentsByDirectory(this.directoryId).subscribe({
      next: (docs) => {
        this.documents = docs;

        docs.forEach(doc => {
          this.userService.getUserById(doc.uploadedById).subscribe({
            next: (user) => this.userCache[doc.uploadedById] = user.name,
            error: () => this.userCache[doc.uploadedById] = `Usuário ${doc.uploadedById}`
          });
        });
      },
      error: (err) => console.error('Erro ao carregar documentos', err)
    });
  }

  loadUserNames() {
    const uniqueUserIds = Array.from(new Set(this.documents.map(d => d.uploadedById)));

    uniqueUserIds.forEach(id => {
      if (!this.userCache[id]) {
        this.userService.getUserById(id).subscribe({
          next: (user: User) => this.userCache[id] = user.name,
          error: () => this.userCache[id] = `Usuário ${id}`
        });
      }
    });
  }

  getUploaderName(id: number): string {
    return this.userCache[id] || `Carregando...`;
  }

  downloadDoc(doc: DocumentDTO) {
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

  substituirDoc(doc: DocumentDTO) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = (event: any) => {
      const file: File = event.target.files[0];
      if (!file) return;

      const descriptionInput = prompt('Digite uma descrição para esta nova versão:', doc.description);
      const description = descriptionInput ?? undefined;

      this.documentService.uploadNewVersion(doc.id, file, description ?? '').subscribe({
        next: (updatedDocFromServer) => {
          if (!updatedDocFromServer) return;

          // Atualiza os dados do documento
          doc.fileUrl = updatedDocFromServer.fileUrl;
          doc.modificationDate = updatedDocFromServer.modificationDate;
          doc.version = updatedDocFromServer.version;
          doc.size = updatedDocFromServer.size;
          doc.description = updatedDocFromServer.description;

          // Atualiza o proprietário para o usuário logado
          doc.uploadedById = this.userId!;
          this.userCache[this.userId!] = this.authService.getUser()?.name || 'Você';

          // Mantém lógica de renomeação da versão
          const nameWithoutExt = doc.name.replace(/\.[^/.]+$/, '');
          const baseName = nameWithoutExt.replace(/\(\d+\)$/, '').trim();
          let versionNumber = 1;
          this.documents.forEach(d => {
            const match = (d.name || '').match(/\((\d+)\)$/);
            if (match) {
              const v = parseInt(match[1], 10);
              if (v >= versionNumber) versionNumber = v + 1;
            }
          });
          const newName = `${baseName} (${versionNumber})`;

          this.documentService.updateDocument(doc.id, { ...doc, name: newName, description }).subscribe({
            next: (docRenamedFromServer) => {
              doc.name = docRenamedFromServer.name;
              doc.version = docRenamedFromServer.version ?? doc.version;
              doc.modificationDate = docRenamedFromServer.modificationDate ?? doc.modificationDate;
              doc.description = docRenamedFromServer.description ?? doc.description;

              // Garante que o proprietário continua o usuário logado
              doc.uploadedById = this.userId!;

              alert(`Nova versão enviada! Documento renomeado para "${doc.name}"`);
              this.loadDocuments();
            },
            error: (err) => {
              console.error('Erro ao renomear documento após upload:', err);
              this.loadDocuments();
            }
          });
        },
        error: (err) => {
          console.error('Erro no upload da nova versão:', err);
          alert('Erro ao enviar nova versão');
        }
      });
    };
    input.click();
  }

  renomearDoc(doc: DocumentDTO) {
    const newName = prompt('Digite o novo nome', this.getDisplayName(doc.name));
    if (!newName || newName === this.getDisplayName(doc.name)) return;

    this.documentService.updateDocument(doc.id, { ...doc, name: newName }).subscribe({
      next: (response) => {
        doc.name = response.name;
        alert('Documento renomeado com sucesso!');
        this.loadDocuments();
      },
      error: (err) => {
        console.error('Erro ao renomear:', err);
        alert('Erro ao renomear documento.');
      }
    });
  }

  deletarDoc(doc: DocumentDTO) {
    if (!confirm(`Deseja realmente deletar ${doc.name}?`)) return;

    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d.id !== doc.id);
        alert('Documento deletado com sucesso!');
      },
      error: () => alert('Erro ao deletar documento.')
    });
  }
}
