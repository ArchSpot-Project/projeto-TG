import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { DocumentService } from '../../core/services/document.service';
import { ToastService } from '../../core/services/toast.service';
import { DocumentVersionDTO } from '../../core/models/document.model';

@Component({
  selector: 'app-doc-versioning-modal',
  templateUrl: './doc-versioning-modal.component.html',
  styleUrls: ['./doc-versioning-modal.component.css']
})
export class DocVersioningModalComponent implements OnInit, OnChanges {

  @Input() documentId: number | null = null;
  @Input() visible = false;
  @Input() documentName: string | null = null;
  @Output() close = new EventEmitter<void>();

  versions: DocumentVersionDTO[] = [];

  constructor(
    private documentService: DocumentService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    if (this.documentId) this.loadVersions();
  }

  ngOnChanges(): void {
    if (this.visible && this.documentId != null) {
      this.loadVersions();
    }
  }

  loadVersions(): void {
    if (!this.documentId) return;

    this.documentService.getDocumentVersions(this.documentId).subscribe({
      next: (v) => {
        this.versions = v.slice(0, 3);
      },
      error: () => this.toast.showError('Erro ao carregar versões.')
    });
  }

  viewVersion(v: DocumentVersionDTO) {
    this.documentService.viewDocumentVersion(v.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  downloadVersion(v: DocumentVersionDTO) {
    this.documentService.downloadDocumentVersion(v.id).subscribe((blob) => {
      const a = document.createElement('a');

      // nome do arquivo a ser baixado
      const fileName = `versao${v.versionNumber}`;

      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();

      URL.revokeObjectURL(url);
    });
  }

  closeModal() {
    this.close.emit();
  }
}
