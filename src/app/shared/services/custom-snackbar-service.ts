import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CustomSnackbarService {
  constructor(public snackBar: MatSnackBar, private zone: NgZone) {}

  public error(message: string, action = 'cerrar', duration = 5000) {
    this.zone.run(() => {
      this.snackBar.open(message, action, {
        duration,
        // panelClass: ['mat-toolbar', 'mat-light']
        panelClass: ['mat-primary', 'snackbar-bg'],
      });
    });
  }
}
