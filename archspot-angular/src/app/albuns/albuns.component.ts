import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../core/services/album.service';
import { Album } from '../core/models/album.model';
import { ProjectService } from '../core/services/project.service';

@Component({
  selector: 'app-album',
  templateUrl: './albuns.component.html',
  styleUrls: ['./albuns.component.css']
})
export class AlbunsComponent implements OnInit {
  albums: Album[] = [];
  projectId!: number;
  projectName = '';
  selectedAlbum: Partial<Album> = {};

  newAlbum: Partial<Album> = {
    name: '',
    description: ''
  };

  constructor(
    private albumService: AlbumService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAlbums();
    this.loadProjectName();
  }

  loadAlbums() {
    this.albumService.getAlbumsByProject(this.projectId).subscribe({
      next: (data) => (this.albums = data),
      error: (err) => console.error('Erro ao carregar álbuns', err),
    });
  }

  loadProjectName(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: proj => this.projectName = proj.name,
      error: err => console.error('Erro ao carregar projeto', err)
    });
  }

  openAlbum(albumId: number) {
    this.router.navigate([`/projects/${this.projectId}/albuns/${albumId}`]);
  }

  createAlbum() {
    if (!this.newAlbum.name) return;

    this.albumService.createAlbum(this.projectId, this.newAlbum).subscribe({
      next: (album) => {
        this.albums.push(album);
        const modal = document.getElementById('modalCriarAlbum');
        if (modal) (window as any).bootstrap.Modal.getInstance(modal).hide();
        alert(`Álbum "${album.name}" criado com sucesso.`);
        this.newAlbum = { name: '', description: '' };
        location.reload();
      },
      error: (err) => console.error('Erro ao criar álbum', err)
    });
  }

  editAlbum(album: Album) {
    this.selectedAlbum = { ...album };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalEditarAlbum'));
    modal.show();
  }

  updateAlbum() {
    if (!this.selectedAlbum?.id) return;

    this.albumService.updateAlbum(this.selectedAlbum.id, this.selectedAlbum).subscribe({
      next: (updated) => {
        const idx = this.albums.findIndex(a => a.id === updated.id);
        if (idx > -1) this.albums[idx] = updated;
        this.selectedAlbum = {};
        const modal = document.getElementById('modalEditarAlbum');
        if (modal) (window as any).bootstrap.Modal.getInstance(modal)?.hide();
      },
      error: (err) => console.error('Erro ao atualizar álbum', err)
    });
  }

  deleteAlbum(album: Album) {
    const confirmDelete = confirm(`Deseja realmente excluir o álbum "${album.name}"?`);
    if (!confirmDelete) return;

    this.albumService.deleteAlbum(album.id!).subscribe({
      next: () => this.albums = this.albums.filter(a => a.id !== album.id),
      error: (err) => console.error('Erro ao deletar álbum', err)
    });
  }
}
