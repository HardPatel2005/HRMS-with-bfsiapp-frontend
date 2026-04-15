import { Injectable, inject, PLATFORM_ID }  from '@angular/core';
import { isPlatformBrowser }               from '@angular/common';
import {
  HttpEvent, HttpHandler, HttpInterceptor,
  HttpRequest, HttpErrorResponse
}                                          from '@angular/common/http';
import {
  Observable, throwError, BehaviorSubject,
  filter, take, switchMap, catchError
}                                          from 'rxjs';
import { AuthService }                     from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly platformId  = inject(PLATFORM_ID);

  private readonly anonymousPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/oauth-login',
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email'
  ];

  private isRefreshing = false;
  private readonly refreshSubject = new BehaviorSubject<string | null>(null);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // ── FIX: SSR runs in Node where localStorage doesn't exist ───────────
    // Skip token attachment entirely on the server — Angular SSR makes
    // unauthenticated prefetch calls for hydration; the browser re-runs
    // them with the real token after hydration completes.
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(req);
    }

    // Skip anonymous auth endpoints
    if (this.isAnonymousPath(req.url)) {
      return next.handle(req);
    }

    // Proactive expiry check
    if (this.authService.isTokenExpired() && this.authService.getRefreshToken()) {
      return this.refreshAndRetry(req, next);
    }

    const token = this.authService.getAccessToken();
    const authReq = token ? this.attachToken(req, token) : req;

    return next.handle(authReq).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.handle401(req, next);
        }
        return throwError(() => err);
      })
    );
  }

  private isAnonymousPath(url: string): boolean {
    const lower = url.toLowerCase();
    return this.anonymousPaths.some(p => lower.includes(p));
  }

  private attachToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private handle401(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.authService.getRefreshToken()) {
      this.authService.logout();
      return throwError(() => new Error('Session expired. Please log in again.'));
    }

    if (this.isRefreshing) {
      return this.refreshSubject.pipe(
        filter((t): t is string => t !== null),
        take(1),
        switchMap(t => next.handle(this.attachToken(req, t)))
      );
    }

    return this.refreshAndRetry(req, next);
  }

  private refreshAndRetry(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.isRefreshing = true;
    this.refreshSubject.next(null);

    return this.authService.refreshAccessToken().pipe(
      switchMap(() => {
        this.isRefreshing = false;
        const newToken = this.authService.getRawAccessToken() ?? '';
        this.refreshSubject.next(newToken);
        return next.handle(this.attachToken(req, newToken));
      }),
      catchError(err => {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => err);
      })
    );
  }
}