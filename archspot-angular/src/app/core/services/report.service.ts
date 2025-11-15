import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReportResponseDTO<T> {
  reportType: string;
  rows: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly baseUrl = `http://localhost:8080/reports`;

  constructor(private http: HttpClient) { }

  generateReport<T>(filters: any): Observable<ReportResponseDTO<T>> {
    return this.http.post<ReportResponseDTO<T>>(`${this.baseUrl}/generate`, filters);
  }
}
