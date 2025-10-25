import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PhaseService {
  private apiUrl = 'http://localhost:8080/project-phases';

  constructor(private http: HttpClient) {}

  getPhasesByProjectId(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/projects/${projectId}/phases`);
  }

  getPhaseStatus(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/phase-status`);
  }

  startPhase(id: number) {
    return this.http.put<any>(`${this.apiUrl}/${id}/start`, {});
  }

  finishPhase(id: number) {
    return this.http.put<any>(`${this.apiUrl}/${id}/finish`, {});
  }
}
