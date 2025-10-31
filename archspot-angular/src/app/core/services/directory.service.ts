import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DirectoryDTO {
  id: number;
  name: string;
  creationDate: string;
  type: string;
  projectId: number;
  parentDirectoryId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DirectoryService {
  private apiUrl = 'http://localhost:8080/directories';

  constructor(private http: HttpClient) { }

  getDirectoriesByProjectAndType(projectId: number, type: string): Observable<DirectoryDTO[]> {
    return this.http.get<DirectoryDTO[]>(`http://localhost:8080/projects/${projectId}/directories?type=${type}`);
  }

  getDocumentsByDirectory(directoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${directoryId}/documents`);
  }

  getSubdirectories(directoryId: number): Observable<DirectoryDTO[]> {
    return this.http.get<DirectoryDTO[]>(`${this.apiUrl}/${directoryId}/subdirectories`);
  }

  createSubdirectory(parentId: number, dto: { name: string }): Observable<DirectoryDTO> {
    return this.http.post<DirectoryDTO>(`${this.apiUrl}/${parentId}/subdirectories`, dto);
  }

  renameDirectory(id: number, newName: string): Observable<DirectoryDTO> {
    return this.http.patch<DirectoryDTO>(`${this.apiUrl}/${id}`, { name: newName });
  }

  deleteDirectory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
