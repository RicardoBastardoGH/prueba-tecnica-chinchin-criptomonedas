import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [MatMenuModule],
  templateUrl: './navbar.html',
  styles: ``,
})
export class Navbar {
  authService = inject(AuthService);
  logout() {
    this.authService.logout();
  }
}
