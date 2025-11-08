import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from '../../core/services/photo.service';
import { AlbumService } from '../../core/services/album.service';
import { ProjectService } from '../../core/services/project.service';
import { UserProjectService } from '../../core/services/user-project.service';
import { AuthService } from '../../core/services/auth.service';
import { Photo } from '../../core/models/photo.model';
import saveAs from 'file-saver';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  projectId!: number;
  albumId!: number;
  photoId!: number;
  projectName = '';
  albumName = '';
  photos: Photo[] = [];
  loading = true;

  selectedPhoto: Photo | null = null;

  userId: number | null = null;
  userRole: string | null = null;
  projectUsers: any[] = [];
  userNames: Record<number, string> = {};

  constructor(
    private route: ActivatedRoute,
    private photoService: PhotoService,
    private projectService: ProjectService,
    private albumService: AlbumService,
    private userProjectService: UserProjectService,
    private authService: AuthService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;

    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.albumId = Number(this.route.snapshot.paramMap.get('albumId'));

    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: users => {
        this.projectUsers = users;
        this.userNames = users.reduce((acc, u) => {
          acc[u.userId] = u.userName;
          return acc;
        }, {} as Record<number, string>);

        this.loadProjectName();
        this.loadAlbumName();
        this.loadPhotos();
      },
      error: err => console.error('Erro ao carregar usuários do projeto', err)
    });
  }
  private saveCreatedPhotoId(photoId: number): void {
    const key = 'createdPhotosByUser';
    const stored = localStorage.getItem(key);
    const map = stored ? JSON.parse(stored) : {};

    if (!this.userId) return;

    if (!map[this.userId]) map[this.userId] = [];
    if (!map[this.userId].includes(photoId)) map[this.userId].push(photoId);

    localStorage.setItem(key, JSON.stringify(map));
  }

  private hasUserCreatedPhoto(photoId: number): boolean {
    const key = 'createdPhotosByUser';
    const stored = localStorage.getItem(key);
    if (!stored || !this.userId) return false;

    const map = JSON.parse(stored);
    return map[this.userId]?.includes(photoId);
  }

  private removeCreatedPhotoId(photoId: number): void {
    const key = 'createdPhotosByUser';
    const stored = localStorage.getItem(key);
    if (!stored || !this.userId) return;

    const map = JSON.parse(stored);
    if (map[this.userId]) {
      map[this.userId] = map[this.userId].filter((id: number) => id !== photoId);
      localStorage.setItem(key, JSON.stringify(map));
    }
  }

  loadPhotos() {
    this.loading = true;

    this.photoService.getPhotosByAlbum(this.albumId).subscribe({
      next: data => {
        const loadPromises = data.map(p =>
          this.photoService.getPhotoView(p.id!).toPromise().then(url => {
            p.fileUrl = url;
            return p;
          })
        );

        Promise.all(loadPromises).then(result => {
          this.photos = result;
          this.loading = false;
        });
      },
      error: err => {
        console.error('Erro ao carregar fotos', err);
        this.loading = false;
      }
    });
  }

  get isCustomerInProject(): boolean {
    if (!this.userId) return false;
    const user = this.projectUsers.find(u => u.userId === this.userId);
    return user?.role === 'CUSTOMER';
  }

  loadProjectName() {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: proj => this.projectName = proj.name,
      error: err => console.error('Erro ao carregar projeto', err)
    });
  }

  loadAlbumName() {
    this.albumService.getAlbumById(this.albumId).subscribe({
      next: album => this.albumName = album.name,
      error: err => console.error('Erro ao carregar álbum', err)
    });
  }

  getUploaderName(photo: Photo): string {
    return photo.uploadedById ? (this.userNames[photo.uploadedById] || 'Desconhecido') : 'Desconhecido';
  }

  canEditOrDelete(photo: Photo): boolean {
    if (!this.userId) return false;
    const isOwner = this.hasUserCreatedPhoto(photo.id);
    return this.isAdmin() || isOwner;
  }

  public isAdmin(): boolean {
    if (!this.userId || !this.projectUsers) return false;
    const currentUser = this.projectUsers.find(u => u.userId === this.userId);
    return currentUser?.role?.toUpperCase() === 'ADMIN';
  }

  downloadAlbum() {
    if (this.photos.length === 0) {
      this.toast.showWarning('O álbum está vazio.');
      return;
    }
    this.photoService.downloadAlbumZip(this.albumName, this.photos)
      .then(blob => saveAs(blob, `${this.albumName}.zip`))
      .catch(err => console.error('Erro ao gerar ZIP', err));
  }

  triggerFileInput() {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  handleFileUpload(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = prompt(`Informe o nome da foto: "${file.name}"`, file.name);
      if (!name) continue;

      this.photoService.uploadPhoto(this.albumId, file, this.userId!, name).subscribe({
        next: photo => {
          this.saveCreatedPhotoId(photo.id);
          this.photoService.getPhotoView(photo.id!).subscribe(url => {
            photo.fileUrl = url;
            this.photos.push(photo);
          });
          this.toast.showSuccess('Foto enviada com sucesso.');
          location.reload();
        },
        error: err => console.error('Erro ao enviar foto', err)
      });
    }
  }

  editPhotoName(photo: Photo) {
    if (!this.canEditOrDelete(photo)) return;

    const newName = prompt('Editar nome da foto:', photo.name);
    if (!newName || newName === photo.name) return;

    this.photoService.updatePhotoName(photo.id!, newName).subscribe({
      next: updated => {
        photo.name = updated.name;
        this.toast.showSuccess(`Nome da foto "${updated.name}" alterado com sucesso`);
      },
      error: err => console.error('Erro ao atualizar nome', err)
    });
  }

  deletePhoto(photo: Photo) {
    if (!this.canEditOrDelete(photo)) return;
    if (!confirm(`Deseja realmente excluir a foto "${photo.name}"?`)) return;

    this.photoService.deletePhoto(photo.id!).subscribe({
      next: () => {
        this.toast.showSuccess(`Foto "${photo.name}" excluída com sucesso`);
        this.removeCreatedPhotoId(photo.id);
        this.photos = this.photos.filter(p => p.id !== photo.id);
      },
      error: err => console.error('Erro ao deletar foto', err)
    });
  }

  openModal(photo: Photo) {
    this.selectedPhoto = photo;
  }

  closeModal() {
    this.selectedPhoto = null;
  }
}