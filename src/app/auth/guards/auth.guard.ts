import { CanActivate, CanActivateFn, CanLoad, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
// import { AprobacionTrcService } from '../services/aprobacion-trc.service';
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService //  private aprobacionTrcService: AprobacionTrcService
  ) {}

  canActivate(): Observable<boolean> | boolean {
    console.log('canActivate');
    return this.authService.validateToken().pipe(
      tap((valid) => {
        console.log('canActivate valid is: ', valid);
        if (!valid) {
          this.router.navigateByUrl('/home');
          return false;
        } else {
          return true;
        }
      })
    );
  }
}
