import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DocumentDTO {
  id: number;
  name: string;
  fileUrl: string;
  description?: string;
  uploadDate: string;
  modificationDate?: string;
  size?: number;
  version?: string;
  uploadedById?: number;
  directoryId: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = 'http://localhost:8080/directories';

  constructor(private http: HttpClient) {}

  getDocumentsByDirectory(directoryId: number): Observable<DocumentDTO[]> {
    return this.http.get<DocumentDTO[]>(`${this.baseUrl}/${directoryId}/documents`);
  }
}
