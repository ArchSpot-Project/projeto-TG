import { Injectable } from '@angular/core';
import { User, UserCredentials } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/users/login';
  private currentUser: User | null = null;

  constructor(private http: HttpClient) { 
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  login(credentials: UserCredentials): Observable<User> {
    return this.http.post<User>(this.apiUrl, credentials);
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user)); // salva no sessionStorage por enquanto
  }

  getUser(): User | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('currentUser');
  }
}
