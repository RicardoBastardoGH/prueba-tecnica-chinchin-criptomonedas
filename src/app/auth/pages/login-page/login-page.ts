import { Component, inject, signal } from '@angular/core';
import { MatLineModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [
    MatLineModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login-page.html',
  styles: ``,
})
export class LoginPage {
  // Injecting dependencies
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  // private customSnackbarService = inject(CustomSnackbarService);
  // private swal = inject(SwalService);

  loading: boolean = false;
  hide = signal(true); // Show/Hide password

  myForm = this.fb.group({
    email: ['usuario@usuario.com', [Validators.required, Validators.email]],
    password: ['123456', [Validators.required, Validators.minLength(3)]],
  });

  fieldHasError(field: 'email' | 'password') {
    const control = this.myForm.get(field);
    return !!(control && control.errors && control.touched);
  }

  // Function to show/hide password
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  login() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      this._snackBar.open('Hay errores en el formulario', undefined, {
        duration: 3000,
      });
      return;
    }

    const { email = '', password = '' } = this.myForm.value;

    console.log(email, password);

    this.loading = true;
    const body = { password: this.myForm.value.password, username: this.myForm.value.email };

    this.authService.login(body).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        this._snackBar.open(err.mensaje || 'Ha ocurrido un error', undefined, {
          duration: 3000,
        });
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
