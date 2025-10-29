import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DirectoryDTO {
  id: number;
  name: string;
  type: 'DRAWINGS' | 'DOCUMENTS';
  projectId: number;
  parentDirectoryId?: number;
  creationDate: string;
  documents?: any[];
  subdirectories?: DirectoryDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class DirectoryService {
  private baseUrl = 'http://localhost:8080/projects';

  constructor(private http: HttpClient) { }

  getDirectoriesByProject(projectId: number, type: 'DOCUMENTS' = 'DOCUMENTS'): Observable<DirectoryDTO[]> {
    let params = new HttpParams().set('type', type);
    return this.http.get<DirectoryDTO[]>(`${this.baseUrl}/${projectId}/directories`, { params });
  }
}
