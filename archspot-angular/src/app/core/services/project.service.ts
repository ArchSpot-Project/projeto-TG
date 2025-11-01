import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { CreateProjectRequest, ProjectResponse } from '../models/project.model';
import { UserProjectResponse } from '../models/user-project.model';

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

  userHasAccess(projectId: number, userId: number) {
    if (!projectId || !userId) {
      return of(false);
    }

    return this.getProjectsByUser(userId).pipe(
      map(projects => {
        return projects.some(p => Number(p.projectId) === Number(projectId));
      }),
      catchError(err => {
        console.error('Erro ao verificar acesso ao projeto:', err);
        return of(false);
      })
    );
  }

  updateProject(projectId: number, payload: { name: string; description?: string }): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.apiUrl}/${projectId}`, payload);
  }

  updateProjectRealDates(projectId: number, realStartDate: Date | null, realEndDate: Date | null) {
    return this.http.patch<ProjectResponse>(`${this.apiUrl}/${projectId}`, {
      realStartDate,
      realEndDate
    });
  }

  updateProjectTitleAndDescription(projectId: number, payload: { name: string; description?: string }) {
    return this.http.patch<ProjectResponse>(`${this.apiUrl}/${projectId}`, payload);
  }

  finalizeProject(projectId: number) {
    return this.http.post<ProjectResponse>(`${this.apiUrl}/${projectId}/finalize`, {});
  }

  cancelProject(projectId: number) {
    return this.http.post<ProjectResponse>(`${this.apiUrl}/${projectId}/cancel`, {});
  }

  deleteProject(projectId: number) {
    return this.http.delete(`${this.apiUrl}/${projectId}`);
  }
}
