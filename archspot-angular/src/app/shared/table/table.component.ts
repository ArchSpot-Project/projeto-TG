import { Component, Input, OnInit } from '@angular/core';
import { DocumentDTO, DocumentService } from '../../core/services/document.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @Input() title = '';
  @Input() directoryId!: number;

  documents: DocumentDTO[] = [];
  userCache: { [id: number]: string } = {};

  constructor(
    private documentService: DocumentService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments() {
    if (!this.directoryId) return;

    this.documentService.getDocumentsByDirectory(this.directoryId).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.loadUserNames();
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

  abrirDoc(doc: DocumentDTO) {
    window.open(doc.fileUrl, '_blank');
  }

  downloadDoc(doc: DocumentDTO) {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = doc.name;
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
      const file = event.target.files[0];
      if (!file) return;

      this.documentService.uploadNewVersion(doc.id, file).subscribe({
        next: (updatedDoc) => {
          alert(`Nova versão enviada com sucesso!`);
          this.loadDocuments();
          location.reload();
        },
        error: () => alert('Erro ao enviar nova versão.')
      });
    };
    input.click();
  }

  renomearDoc(doc: DocumentDTO) {
    const newName = prompt('Digite o novo nome', doc.name);
    if (!newName || newName === doc.name) return;

    const updatedDoc = { ...doc, name: newName };

    this.documentService.updateDocument(doc.id, updatedDoc).subscribe({
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
        location.reload();
      },
      error: () => alert('Erro ao deletar documento.')
    });
  }
}
