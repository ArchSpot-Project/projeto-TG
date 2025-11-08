import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, UserCredentials } from '../models/user.model';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private tokenKey = 'jwt_token';
  private userKey = 'currentUser';
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {
    const storedUser = sessionStorage.getItem(this.userKey);
    const storedToken = sessionStorage.getItem(this.tokenKey);
    if (storedUser && storedToken) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  login(credentials: UserCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        sessionStorage.setItem(this.tokenKey, response.token);
        sessionStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.currentUser = response.user;
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.currentUser = null;
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
  }

  register(data: any, file?: File): Observable<any> {
    const formData = new FormData();

    // adiciona campos de texto
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    // adiciona a imagem (se houver)
    if (file) {
      formData.append('profileImage', file);
    }

    return this.http.post(`${this.apiUrl}/register`, formData);
  }
}
