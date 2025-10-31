import { Component, Input, OnInit } from '@angular/core';
import { DirectoryService, DirectoryDTO } from '../../core/services/directory.service';
import { DocumentDTO, DocumentService } from '../../core/services/document.service';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css']
})
export class DirectoryComponent implements OnInit {
  @Input() directory!: DirectoryDTO;
  subdirectories: DirectoryDTO[] = [];
  documents: DocumentDTO[] = [];
  expanded = false;

  constructor(
    private directoryService: DirectoryService,
    private documentService: DocumentService
  ) { }

  ngOnInit(): void {
  }

  toggleExpand() {
    this.expanded = !this.expanded;

    if (this.expanded) {
      this.loadSubdirectories();
      this.loadDocuments();
    }
  }

  loadSubdirectories() {
    this.directoryService.getSubdirectories(this.directory.id).subscribe({
      next: (subdirs) => this.subdirectories = subdirs,
      error: (err) => console.error('Erro ao carregar subdiretórios', err)
    });
  }

  loadDocuments() {
    this.documentService.getDocumentsByDirectory(this.directory.id).subscribe({
      next: (docs) => this.documents = docs,
      error: (err) => console.error('Erro ao carregar documentos', err)
    });
  }

  criarSubdiretorio() {
    const nome = prompt('Nome do novo subdiretório:');
    if (!nome) return;

    this.directoryService.createSubdirectory(this.directory.id, { name: nome }).subscribe({
      next: (novo) => {
        this.subdirectories.push(novo);
        alert('Subdiretório criado!');
      },
      error: (err) => alert('Erro ao criar subdiretório')
    });
  }

  renomearDiretorio() {
    const novoNome = prompt('Novo nome do diretório:', this.directory.name);
    if (!novoNome || novoNome === this.directory.name) return;

    this.directoryService.renameDirectory(this.directory.id, novoNome).subscribe({
      next: (updated) => {
        this.directory.name = updated.name;
        alert('Diretório renomeado com sucesso!');
      },
      error: () => alert('Erro ao renomear diretório.')
    });
  }

  deletarDiretorio() {
    if (confirm(`Deseja deletar o diretório "${this.directory.name}" e todo o seu conteúdo?`)) {
      this.directoryService.deleteDirectory(this.directory.id).subscribe({
        next: () => alert('Diretório deletado!'),
        error: () => alert('Erro ao deletar diretório.')
      });
    }
  }
}
