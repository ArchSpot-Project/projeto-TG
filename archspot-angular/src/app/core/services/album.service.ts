import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Album } from '../models/album.model';

@Injectable({ providedIn: 'root' })
export class AlbumService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAlbumsByProject(projectId: number): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.baseUrl}/projects/${projectId}/albums`);
  }

  getAlbumById(id: number): Observable<Album> {
    return this.http.get<Album>(`${this.baseUrl}/albums/${id}`);
  }

  createAlbum(projectId: number, data: Partial<Album>): Observable<Album> {
    return this.http.post<Album>(`${this.baseUrl}/projects/${projectId}/albums`, data);
  }

  updateAlbum(id: number, data: Partial<Album>): Observable<Album> {
    return this.http.put<Album>(`${this.baseUrl}/albums/${id}`, data);
  }

  deleteAlbum(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/albums/${id}`);
  }
}
