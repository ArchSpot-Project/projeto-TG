import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from '../../core/services/photo.service';
import { AlbumService } from '../../core/services/album.service';
import { ProjectService } from '../../core/services/project.service';
import { Photo } from '../../core/models/photo.model';
import saveAs from 'file-saver';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  projectId!: number;
  albumId!: number;

  projectName = '';
  albumName = '';
  photos: Photo[] = [];
  loading = true;

  selectedPhoto: Photo | null = null;

  constructor(
    private route: ActivatedRoute,
    private photoService: PhotoService,
    private projectService: ProjectService,
    private albumService: AlbumService
  ) { }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.albumId = Number(this.route.snapshot.paramMap.get('albumId'));

    this.loadProjectName();
    this.loadAlbumName();
    this.loadPhotos();
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

  loadPhotos() {
    this.loading = true;
    this.photoService.getPhotosByAlbum(this.albumId).subscribe({
      next: data => {
        this.photos = data.map(p => ({ ...p, fileUrl: `http://localhost:8080/photos/${p.id}/view` }));
        this.loading = false;
      },
      error: err => {
        console.error('Erro ao carregar fotos', err);
        this.loading = false;
      }
    });
  }

  downloadAlbum() {
    if (this.photos.length === 0) {
      alert('O álbum está vazio.');
      return;
    }

    this.photoService.downloadAlbumZip(this.albumName, this.photos)
      .then(blob => {
        saveAs(blob, `${this.albumName}.zip`);
      })
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

      this.photoService.uploadPhoto(this.albumId, file, name).subscribe({
        next: photo => {
          photo.fileUrl = `http://localhost:8080/photos/${photo.id}/view`;
          this.photos.push(photo);
          alert("Foto enviada com sucesso.");
          location.reload();
        },
        error: err => console.error('Erro ao enviar foto', err)
      });
    }
  }

  editPhotoName(photo: Photo) {
    const newName = prompt('Editar nome da foto:', photo.name);
    if (!newName || newName === photo.name) return;

    this.photoService.updatePhotoName(photo.id!, newName).subscribe({
      next: updated => {
        photo.name = updated.name;
        alert(`Nome da foto "${updated.name}" alterado com sucesso`);
      },
      error: err => console.error('Erro ao atualizar nome', err)
    });
  }

  deletePhoto(photo: Photo) {
    if (!confirm(`Deseja realmente excluir a foto "${photo.name}"?`)) return;

    this.photoService.deletePhoto(photo.id!).subscribe({
      next: () => {
        alert(`Foto "${photo.name}" excluída com sucesso`);
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