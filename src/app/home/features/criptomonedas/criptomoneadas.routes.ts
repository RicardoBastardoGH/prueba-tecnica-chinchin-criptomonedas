import { Routes } from '@angular/router';
import { Intercambiar } from './pages/intercambiar/intercambiar';
import { Main } from './pages/main/main';
import { Consultar } from './pages/consultar/consultar';

export const criptomonedasRoutes: Routes = [
  {
    path: '',
    component: Main,
  },
  {
    path: '',
    component: Intercambiar,
  },

  // {
  //   path: 'intercambio',
  //   component: ProductsAdminPageComponent,
  // },
  {
    path: 'consultar/:id',
    component: Consultar,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export default criptomonedasRoutes;
