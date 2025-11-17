import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private baseUrl = 'http://localhost:8080/projects';

  constructor(private http: HttpClient) {}

  getByProject(projectId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.baseUrl}/${projectId}/activities`);
  }
}
