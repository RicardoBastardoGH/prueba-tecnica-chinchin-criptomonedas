import { Routes } from '@angular/router';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { LoginPage } from './pages/login-page/login-page';
// import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
// import { LoginPageComponent } from './pages/login-page/login-page.component';
// import { RegisterPageComponent } from './pages/register-page/register-page.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: LoginPage,
      },
      // {
      //   path: 'register',
      //   component: RegisterPageComponent,
      // },
      {
        path: '**',
        redirectTo: 'login',
      },
    ],
  },
];

export default authRoutes;
