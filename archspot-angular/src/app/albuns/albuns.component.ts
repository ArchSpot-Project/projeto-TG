import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../core/services/album.service';
import { Album } from '../core/models/album.model';
import { ProjectService } from '../core/services/project.service';
import { AuthService } from '../core/services/auth.service';
import { UserProjectService } from '../core/services/user-project.service';

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
    private router: Router
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

  get isCustomerInProject(): boolean {
    if (!this.userId) return false;
    const user = this.projectUsers.find(u => u.userId === this.userId);
    return user?.role === 'CUSTOMER';
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

  canEditOrDeleteAlbum(): boolean {
    if (!this.userId || !this.projectUsers) return false;
    const currentUser = this.projectUsers.find(u => u.userId === this.userId);
    return currentUser?.role?.toUpperCase() === 'ADMIN';
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
