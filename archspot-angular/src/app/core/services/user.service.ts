import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserCreateDTO } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: UserCreateDTO) {
    return this.http.post<User>(`${this.apiUrl}/create`, user);
  }

  updateUser(id: number, data: UserCreateDTO): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }
}
