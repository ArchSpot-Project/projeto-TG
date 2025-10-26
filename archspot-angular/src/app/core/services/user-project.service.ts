import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProjectResponse {
  id: number;
  userId: number;
  userName: string;
  projectId: number;
  projectName: string;
  role: string;
}

export interface UserProjectRequest {
  userId: number;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserProjectService {
  private baseUrl = 'http://localhost:8080/projects';

  constructor(private http: HttpClient) { }

  getUsersByProject(projectId: number): Observable<UserProjectResponse[]> {
    return this.http.get<UserProjectResponse[]>(`${this.baseUrl}/${projectId}/users`);
  }

  addUserToProject(payload: { userId: number; projectId: number; role: string }) {
    return this.http.post('http://localhost:8080/user-projects', payload);
  }

  removeUserFromProject(projectId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projectId}/users/${userId}`);
  }

  updateUserRole(projectId: number, userId: number, role: string) {
    return this.http.put(`${this.baseUrl}/${projectId}/users/${userId}/role`, { role });
  }
}
