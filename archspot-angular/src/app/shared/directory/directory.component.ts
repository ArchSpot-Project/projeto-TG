import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DirectoryDTO, DirectoryService } from '../../core/services/directory.service';
import { DocumentDTO, DocumentService } from '../../core/services/document.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css']
})
export class DirectoryComponent implements OnInit {
  @Input() directory!: DirectoryDTO;
  @Output() directoryDeleted = new EventEmitter<number>();

  documents: DocumentDTO[] = [];
  expanded = false;

  constructor(
    private directoryService: DirectoryService,
    private documentService: DocumentService,
    private authService: AuthService
  ) { }

  isCustomer(): boolean {
    const user = this.authService.getUser();
    return user?.userRole === 'CUSTOMER';
  }

  ngOnInit(): void { }

  toggleExpand() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.loadDocuments();
    }
  }

  loadDocuments() {
    this.documentService.getDocumentsByDirectory(this.directory.id).subscribe({
      next: (docs) => (this.documents = docs),
      error: (err) => console.error('Erro ao carregar documentos', err),
    });
  }

  uploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const uploadedById = 1; // ID do usuário logado

      this.documentService.uploadDocument(this.directory.id, file, uploadedById).subscribe({
        next: () => {
          alert('Documento enviado com sucesso!');
          this.loadDocuments();
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao enviar documento.');
        },
      });
    };
    input.click();
  }

  renomearDiretorio() {
    const novoNome = prompt('Novo nome do diretório:', this.directory.name);
    if (!novoNome || novoNome === this.directory.name) return;

    this.directoryService.renameDirectory(this.directory.id, novoNome).subscribe({
      next: (updated) => {
        this.directory.name = updated.name;
        alert('Diretório renomeado com sucesso!');
      },
      error: () => alert('Erro ao renomear diretório.'),
    });
  }

  deletarDiretorio() {
    const confirmacao = confirm(
      `Deseja realmente excluir o diretório "${this.directory.name}" e todo o seu conteúdo?`
    );
    if (!confirmacao) return;

    this.directoryService.deleteDirectory(this.directory.id).subscribe({
      next: () => {
        alert('Diretório excluído com sucesso!');
        this.directoryDeleted.emit(this.directory.id); // Notifica o pai
      },
      error: () => alert('Erro ao excluir diretório.'),
    });
  }
}
