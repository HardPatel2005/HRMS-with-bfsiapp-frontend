import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser }   from '@angular/common';
import { CanMatchFn, Router }  from '@angular/router';
import { AuthService }         from '../services/auth.service';

export const authGuard: CanMatchFn = (_route, segments) => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const platformId  = inject(PLATFORM_ID);

  // SSR — no localStorage, pass through. The browser guard run handles auth.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Browser — check for valid non-expired token
  const token = authService.getAccessToken();
  if (token) {
    return true;
  }

  // No valid token — redirect to login with return URL
  const returnUrl = '/' + segments.map(s => s.path).join('/');
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl }
  });
};