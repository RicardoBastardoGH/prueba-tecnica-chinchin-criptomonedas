import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';
import { LoginResponse } from '../interfaces/login-response.interface';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl: string = environment.baseUrl;
  private http = inject(HttpClient);
  private router = inject(Router);

  private _currentUser = signal<any | null>(null);

  get user() {
    return computed(this._currentUser());
  }

  private setAuthentication(body: any, user: User, token: string): boolean {
    console.log(body);
    console.log(token);
    console.log('************************');
    this._currentUser.set(user);
    localStorage.setItem('token', token);
    return true;
  }

  login(body: any): Observable<any> {
    const url = `${this.baseUrl}usuarios/login/`;

    return this.http.post<LoginResponse>(url, body).pipe(
      map((resp: any) => this.setAuthentication(resp, resp.user, resp.token)),
      catchError((err: any) => {
        console.log(err.error);
        return throwError(() => err.error);
      })
    );
  }
}
