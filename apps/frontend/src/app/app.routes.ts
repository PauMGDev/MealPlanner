import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing/landing-page.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./auth/callback/callback.component').then(m => m.CallbackComponent),
  },
  {
    path: 'app',
    loadComponent: () => import('./shell/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./shell/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'pantry',
        loadComponent: () => import('./shell/pantry/pantry.component').then(m => m.PantryComponent),
      },
      {
        path: 'recipes',
        loadComponent: () => import('./shell/recipes/recipes.component').then(m => m.RecipesComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
