import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class SearchUserService {
  private baseUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  search(term: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.baseUrl}?search=${encodeURIComponent(term)}`);
  }
}
