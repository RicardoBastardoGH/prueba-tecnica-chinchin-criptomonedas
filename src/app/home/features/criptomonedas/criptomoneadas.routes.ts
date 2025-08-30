import { Routes } from '@angular/router';
import { Consultar } from './pages/consultar/consultar';
import { Intercambiar } from './pages/intercambiar/intercambiar';
// import { AdminDashboardLayoutComponent } from './layouts/admin-dashboard-layout/admin-dashboard-layout.component';
// import { ProductAdminPageComponent } from './pages/product-admin-page/product-admin-page.component';
// import { ProductsAdminPageComponent } from './pages/products-admin-page/products-admin-page.component';
// import { IsAdminGuard } from '@auth/guards/is-admin.guard';

export const criptomonedasRoutes: Routes = [
  {
    path: '',
    component: Consultar,
  },
  {
    path: '',
    component: Intercambiar,
  },
  {
        path: '**',
        redirectTo: '',
      },
];

export default criptomonedasRoutes;
