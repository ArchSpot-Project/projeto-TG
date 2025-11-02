import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photo } from '../models/photo.model';
import JSZip from 'jszip';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getPhotosByAlbum(albumId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.baseUrl}/albums/${albumId}/photos`);
  }

  uploadPhoto(albumId: number, file: File, optionalName?: string): Observable<Photo> {
    const formData = new FormData();
    formData.append('file', file);
    if (optionalName) formData.append('optionalName', optionalName);
    formData.append('uploadedById', '1');

    return this.http.post<Photo>(`${this.baseUrl}/albums/${albumId}/photos`, formData);
  }

  updatePhotoName(photoId: number, newName: string): Observable<Photo> {
    return this.http.patch<Photo>(`${this.baseUrl}/photos/${photoId}`, { name: newName });
  }

  deletePhoto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/photos/${id}`);
  }

  downloadAlbumZip(albumName: string, photos: Photo[]) {
    const zip = new JSZip();
    const folder = zip.folder(albumName) || zip;

    const photoPromises = photos.map(photo =>
      fetch(photo.fileUrl)
        .then(res => res.blob())
        .then(blob => folder.file(photo.name, blob))
    );

    return Promise.all(photoPromises).then(() => {
      return zip.generateAsync({ type: 'blob' });
    });
  }
}