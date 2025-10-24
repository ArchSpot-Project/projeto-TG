import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectResponse {
  id: number;
  name: string;
  estimatedStartDate?: Date;
  estimatedEndDate?: Date;
  description?: string;
  totalValue?: number;
  status?: string;
  phases?: any[];
}

export interface UserProjectResponse {
  id: number;
  userId: number;
  userName: string;
  projectId: number;
  projectName: string;
  role: string;
}

export interface CreateProjectRequest {
  name: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  description?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = 'http://localhost:8080/projects';
  private userApiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) { }

  getAll(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(this.apiUrl);
  }

  getProjectById(id: number): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/${id}`);
  }

  getProjectsByUser(userId: number): Observable<UserProjectResponse[]> {
    return this.http.get<UserProjectResponse[]>(`${this.userApiUrl}/${userId}/projects`);
  }

  createProject(payload: CreateProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.apiUrl, payload);
  }

  assignUserToProject(projectId: number, userId: number, role: string) {
    return this.http.post(
      `${this.apiUrl}/${projectId}/users/${userId}?role=${role}`,
      {}
    );
  }
}
