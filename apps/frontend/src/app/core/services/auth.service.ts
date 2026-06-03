import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly TOKEN_KEY = 'mm_token';

  private readonly _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  readonly user = computed(() => {
    const token = this._token();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      if (payload.exp * 1000 < Date.now()) {
        this.clearToken();
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  });

  token(): string | null {
    return this._token();
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }

  login(email: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => this.saveToken(res.access_token)));
  }

  register(name: string, email: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${environment.apiUrl}/auth/register`, { name, email, password })
      .pipe(tap(res => this.saveToken(res.access_token)));
  }

  logout(): void {
    this.clearToken();
    this.router.navigate(['/']);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._token.set(token);
  }

  private clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
  }
}
