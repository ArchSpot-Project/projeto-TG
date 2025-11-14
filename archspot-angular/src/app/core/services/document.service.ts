import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentDTO, DocumentVersionDTO } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getDocumentById(id: number): Observable<DocumentDTO> {
    return this.http.get<DocumentDTO>(`${this.baseUrl}/documents/${id}`);
  }

  getDocumentsByDirectory(directoryId: number): Observable<DocumentDTO[]> {
    return this.http.get<DocumentDTO[]>(`${this.baseUrl}/directories/${directoryId}/documents`);
  }

  uploadDocument(directoryId: number, file: File, uploadedById: number, description?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedById', uploadedById.toString());
    if (description) formData.append('description', description);

    return this.http.post<DocumentDTO>(
      `http://localhost:8080/directories/${directoryId}/documents`,
      formData
    );
  }

  updateDocument(id: number, dto: DocumentDTO): Observable<DocumentDTO> { //renomear
    return this.http.put<DocumentDTO>(`${this.baseUrl}/documents/${id}`, dto);
  }

  uploadNewVersion(id: number, file: File, description: string = ''): Observable<DocumentDTO> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    return this.http.post<DocumentDTO>(`${this.baseUrl}/documents/${id}/update`, formData);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/${id}/download`, { responseType: 'blob' });
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/documents/${id}`);
  }

  viewDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/documents/${id}/view`, { responseType: 'blob' });
  }

  getDocumentVersions(documentId: number): Observable<DocumentVersionDTO[]> {
    return this.http.get<DocumentVersionDTO[]>(
      `${this.baseUrl}/documents/${documentId}/versions`
    );
  }

  viewDocumentVersion(versionId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/documents/versions/${versionId}/view`,
      { responseType: 'blob' }
    );
  }

  downloadDocumentVersion(versionId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/documents/versions/${versionId}/download`,
      { responseType: 'blob' }
    );
  }
}
