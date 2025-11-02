import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from '../../core/services/photo.service';
import { AlbumService } from '../../core/services/album.service';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent implements OnInit {
  projectId!: number;
  albumId!: number;
  photos: any[] = [];
  loading = true;
  albumName = '';
  projectName = '';

  constructor(
    private route: ActivatedRoute,
    private photoService: PhotoService,
    private projectService: ProjectService,
    private albumService: AlbumService
  ) { }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.albumId = Number(this.route.snapshot.paramMap.get('albumId'));
    this.loadAlbumName();
    this.loadProjectName();
    this.loadPhotos();
  }

  loadAlbumName(): void {
    this.albumService.getAlbumById(this.albumId).subscribe({
      next: (album) => {
        this.albumName = album.name;
      },
      error: (err) => console.error('Erro ao carregar álbum:', err)
    });
  }

  loadProjectName(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: proj => this.projectName = proj.name,
      error: err => console.error('Erro ao carregar projeto', err)
    });
  }

  loadPhotos(): void {
    this.loading = true;
    this.photoService.getPhotosByAlbum(this.albumId).subscribe({
      next: (data) => {
        this.photos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar fotos:', err);
        this.loading = false;
      }
    });
  }
}