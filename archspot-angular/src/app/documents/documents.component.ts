import { Component, OnInit } from '@angular/core';
import { DirectoryDTO, DirectoryService } from '../core/services/directory.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {

  directories: DirectoryDTO[] = [];
  subdirectories: DirectoryDTO[] = [];

  activeTabId: number | null = null;
  activeSubTabId: number | null = null;

  projectId = 1; // TODO: pegar dinamicamente conforme o projeto atual

  constructor(private directoryService: DirectoryService) { }

  ngOnInit(): void {
    this.loadDirectories();
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
    this.activeSubTabId = null;
    this.subdirectories = [];

    this.directoryService.getSubdirectories(dir.id).subscribe({
      next: (subs) => {
        this.subdirectories = subs;
        if (subs.length > 0) {
          this.activeSubTabId = subs[0].id;
        }
      },
      error: (err) => console.error('Erro ao carregar subdiretórios', err)
    });
  }

  setActiveSubTab(sub: DirectoryDTO) {
    this.activeSubTabId = sub.id;
  }
}
