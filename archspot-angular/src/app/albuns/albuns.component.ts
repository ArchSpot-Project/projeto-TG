import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../core/services/album.service';
import { Album } from '../core/models/album.model';
import { ProjectService } from '../core/services/project.service';
import { AuthService } from '../core/services/auth.service';
import { UserProjectService } from '../core/services/user-project.service';
import { ToastService } from '../core/services/toast.service';

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
  userRole: string | null = null;
  userId: number | null = null;
  projectUsers: any[] = [];

  newAlbum: Partial<Album> = {
    name: '',
    description: ''
  };

  constructor(
    private authService: AuthService,
    private userProjectService: UserProjectService,
    private albumService: AlbumService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;
    this.userRole = currentUser?.userRole || null;

    this.projectId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadProjectUsers();
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

  loadProjectUsers(): void {
    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: users => this.projectUsers = users,
      error: err => console.error('Erro ao carregar usuários do projeto', err)
    });
  }

  openAlbum(albumId: number) {
    this.router.navigate([`/projects/${this.projectId}/albuns/${albumId}`]);
  }

  createAlbum() {
    if (!this.newAlbum.name) return;

    const albumData: Partial<Album> = {
      ...this.newAlbum
    };

    this.albumService.createAlbum(this.projectId, albumData).subscribe({
      next: (album) => {
        this.albums.push(album);
        this.saveCreatedAlbumId(album.id);
        const modal = document.getElementById('modalCriarAlbum');
        if (modal) (window as any).bootstrap.Modal.getInstance(modal).hide();
        this.toast.showSuccess(`Álbum "${album.name}" criado com sucesso.`);
        this.newAlbum = { name: '', description: '' };
      },
      error: (err) => console.error('Erro ao criar álbum', err)
    });
  }

  public isAdmin(): boolean {
    if (!this.userId || !this.projectUsers) return false;
    const currentUser = this.projectUsers.find(u => u.userId === this.userId);
    return currentUser?.role?.toUpperCase() === 'ADMIN';
  }

  canDeleteAlbum(album: Album): boolean {
    if (!this.userId) return false;
    const isOwner = this.hasUserCreatedAlbum(album.id);
    return this.isAdmin() || isOwner;
  }

  private saveCreatedAlbumId(albumId: number): void {
    const key = 'createdAlbumsByUser';
    const stored = localStorage.getItem(key);
    const map = stored ? JSON.parse(stored) : {};

    if (!this.userId) return;

    if (!map[this.userId]) map[this.userId] = [];
    if (!map[this.userId].includes(albumId)) map[this.userId].push(albumId);

    localStorage.setItem(key, JSON.stringify(map));
  }

  private hasUserCreatedAlbum(albumId: number): boolean {
    const key = 'createdAlbumsByUser';
    const stored = localStorage.getItem(key);
    if (!stored || !this.userId) return false;

    const map = JSON.parse(stored);
    return map[this.userId]?.includes(albumId);
  }

  private removeCreatedAlbumId(albumId: number): void {
    const key = 'createdAlbumsByUser';
    const stored = localStorage.getItem(key);
    if (!stored || !this.userId) return;

    const map = JSON.parse(stored);
    if (map[this.userId]) {
      map[this.userId] = map[this.userId].filter((id: number) => id !== albumId);
      localStorage.setItem(key, JSON.stringify(map));
    }
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
    if (!this.canDeleteAlbum(album)) {
      this.toast.showWarning('Você não tem permissão para excluir este álbum.');
      return;
    }

    const confirmDelete = confirm(`Deseja realmente excluir o álbum "${album.name}"?`);
    if (!confirmDelete) return;

    this.albumService.deleteAlbum(album.id!).subscribe({
      next: () => {
        this.albums = this.albums.filter(a => a.id !== album.id);
        this.removeCreatedAlbumId(album.id);
        this.toast.showSuccess("Álbum excluído com sucesso.");
        location.reload();
      },
      error: (err) => console.error('Erro ao deletar álbum', err)
    });
  }
}
