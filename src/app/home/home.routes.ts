import { Routes } from '@angular/router';
import { HomeLayout } from './layouts/home-layout/home-layout';

export const adminDashboardRoutes: Routes = [
  {
    path: '',
    component: HomeLayout,
    // canMatch: [IsAdminGuard],
    children: [
      {
        path: 'criptomonedas',
        loadChildren: () => import('./features/criptomonedas/criptomoneadas.routes'),
      },

      {
        path: '**',
        redirectTo: 'criptomonedas',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default adminDashboardRoutes;
