import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { LoginResponse } from '../interfaces/login-response.interface';
import { User } from '../interfaces/user';
import { AuthResponse } from '../interfaces/auth.interface';
import { AuthStatus } from '../interfaces/auth-status.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl: string = environment.baseUrl;
  private http = inject(HttpClient);
  private router = inject(Router);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);

  private _currentUser = signal<any | null>(null);

  private _user!: any;
  get user() {
    return { ...this._user };
  }

  // get user() {
  //   return computed(this._currentUser());
  // }

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

  validateToken() {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}usuarios/check_token/?token=${token}`;
    const header = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Token ${token}`);
    const body = { token };
    console.log('carcel');
    console.log('Token de localStorage: ', token);
    if (!token) {
      // console.log('jajaja');
      return of(false);
    }

    console.log(url);

    // return this.http.get<AuthResponse>(url,{headers}, { body})
    return this.http.post<AuthResponse>(url, body, { headers: header }).pipe(
      map((resp) => {
        console.log(resp);
        this._user = resp;
        return true;
      }),
      catchError((err) => of(false))
    );
  }

  logout() {
    localStorage.removeItem('token');
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
    this.router.navigate(['auth/login']);
  }
}
