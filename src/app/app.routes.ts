import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
  },

  // {
  //   path: 'admin',
  //   loadChildren: () => import('./admin-dashboard/admin-dashboard.routes'),
  // },
  {
    path: 'home',
    loadChildren: () => import('./home/home.routes'),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
