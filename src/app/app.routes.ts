import { Routes }    from '@angular/router';
import { authGuard }  from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Default redirect ───────────────────────────────────────────────────
  {
    path:        '',
    redirectTo:  '/login',
    pathMatch:   'full',
  },

  // ── Public routes (no guard) ───────────────────────────────────────────
  {
    path:          'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent),
  },
  {
    path:          'register',
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.RegisterComponent),
  },

  // ── Protected routes — authGuard redirects to /login if not logged in ──
  {
    path:          'dashboard',
    canMatch:      [authGuard],
    loadComponent: () =>
      import('./features/hrms/dashboard/dashboard').then(m => m.DashboardComponent),
  },
  {
    path:         'utilities',
    canMatch:     [authGuard],
    loadChildren: () =>
      import('./features/hrms/utilities/utilities-routing').then(m => m.utilitiesRoutes),
  },
  {
    path:         'reports',
    canMatch:     [authGuard],
    loadChildren: () =>
      import('./features/hrms/reports/reports-routing').then(m => m.reportsRoutes),
  },
  {
    path:          'profile',
    canMatch:      [authGuard],
    loadComponent: () =>
      import('./features/hrms/profile/profile').then(m => m.ProfileComponent),
  },
  {
    path:         'customers',
    canMatch:     [authGuard],
    loadChildren: () =>
      import('./features/customer/customer-routing-module').then(m => m.customerRoutes),
  },
  {
    path:         'mf-investing',
    canMatch:     [authGuard],
    loadChildren: () =>
      import('./features/mf-investing/mf-investing-routing-module').then(m => m.mfInvestingRoutes),
  },

  // ── Catch-all ──────────────────────────────────────────────────────────
  {
    path:       '**',
    redirectTo: '/login',
  },
];