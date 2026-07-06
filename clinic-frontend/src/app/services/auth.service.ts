import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/signin`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('clinic_token', response.token);
          localStorage.setItem('clinic_user', JSON.stringify({
            id: response.id,
            username: response.username,
            email: response.email,
            role: response.role
          }));
        }
      })
    );
  }

  signup(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, user, { responseType: 'text' });
  }

  logout(): void {
    localStorage.removeItem('clinic_token');
    localStorage.removeItem('clinic_user');
  }

  getToken(): string | null {
    return localStorage.getItem('clinic_token');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('clinic_user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email }, { responseType: 'text' });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { token, password: newPassword }, { responseType: 'text' });
  }
}
