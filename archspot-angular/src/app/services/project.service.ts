import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectResponse {
  id: number;
  name: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  description?: string;
  totalValue?: number;
  status?: string;
  phases?: any[];
}

export interface ProjectRequest {
  name: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  description?: string;
  totalValue?: number;
  status?: string;
  phases?: any[];
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = 'http://localhost:8080/projects';

  constructor(private http: HttpClient) { }

  getAll(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/${id}`);
  }
}
