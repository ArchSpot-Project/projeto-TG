import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PhaseTemplateDTO, ProjectTemplateDTO } from '../models/project-template.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = 'http://localhost:8080/templates';

  constructor(private http: HttpClient) { }

  getProjectTemplates(): Observable<ProjectTemplateDTO[]> {
    return this.http.get<ProjectTemplateDTO[]>(`${this.apiUrl}/project`);
  }

  getProjectTemplateById(id: number): Observable<ProjectTemplateDTO> {
    return this.http.get<ProjectTemplateDTO>(`${this.apiUrl}/project/${id}`);
  }

  createProjectTemplate(dto: ProjectTemplateDTO): Observable<ProjectTemplateDTO> {
    return this.http.post<ProjectTemplateDTO>(`${this.apiUrl}/project`, dto);
  }

  getAllPhaseTemplates(): Observable<PhaseTemplateDTO[]> {
    return this.http.get<PhaseTemplateDTO[]>(`${this.apiUrl}/phase`);
  }

  getPhaseTemplateById(id: number): Observable<PhaseTemplateDTO> {
    return this.http.get<PhaseTemplateDTO>(`${this.apiUrl}/phase/${id}`);
  }

  createPhaseTemplate(dto: PhaseTemplateDTO): Observable<PhaseTemplateDTO> {
    return this.http.post<PhaseTemplateDTO>(`${this.apiUrl}/phase`, dto);
  }
}
