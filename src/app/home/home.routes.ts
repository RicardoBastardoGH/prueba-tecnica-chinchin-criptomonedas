import { Routes } from '@angular/router';
// import { AdminDashboardLayoutComponent } from './layouts/admin-dashboard-layout/admin-dashboard-layout.component';
// import { ProductAdminPageComponent } from './pages/product-admin-page/product-admin-page.component';
// import { ProductsAdminPageComponent } from './pages/products-admin-page/products-admin-page.component';
// import { IsAdminGuard } from '@auth/guards/is-admin.guard';
import { HomeLayout } from './layouts/home-layout/home-layout';

export const adminDashboardRoutes: Routes = [
  {
    path: '',
    component: HomeLayout,
    // canMatch: [IsAdminGuard],
    children: [
      // {
      //   path: 'consultar',
      //   component: ProductsAdminPageComponent,
      // },
      // {
      //   path: 'intercambio',
      //   component: ProductsAdminPageComponent,
      // },
      // {
      //   path: 'products/:id',
      //   component: ProductAdminPageComponent,
      // },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];

export default adminDashboardRoutes;
