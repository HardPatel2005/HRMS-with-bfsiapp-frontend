import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  BehaviorSubject,
  Observable,
  from,
  switchMap,
  tap,
  throwError,
  catchError
} from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  OAuthLoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SimpleResponse,
  UserDto
} from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ── Storage keys ──────────────────────────────────────────────────────────
  private readonly tokenKey        = 'bfsi_access_token';
  private readonly refreshTokenKey = 'bfsi_refresh_token';
  private readonly expiryKey       = 'bfsi_token_expiry';
  private readonly userKey         = 'bfsi_user';

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiService = inject(ApiService);

  // ── State ─────────────────────────────────────────────────────────────────
  private readonly loggedInSubject    = new BehaviorSubject<boolean>(this.hasValidToken());
  private readonly currentUserSubject = new BehaviorSubject<UserDto | null>(this.loadStoredUser());
  private googleScriptLoadPromise?: Promise<void>;

  readonly isLoggedIn$  = this.loggedInSubject.asObservable();
  readonly currentUser$ = this.currentUserSubject.asObservable();

  // ══════════════════════════════════════════════════════════════════════════
  // Public auth methods
  // ══════════════════════════════════════════════════════════════════════════

  /** POST /api/auth/login */
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/api/auth/login', payload).pipe(
      tap(res => this.setSession(res)),
      catchError(err => {
        console.error('[AuthService] login error', err);
        return throwError(() => err);
      })
    );
  }

  /** POST /api/auth/register */
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/api/auth/register', payload).pipe(
      tap(res => this.setSession(res)),
      catchError(err => {
        console.error('[AuthService] register error', err);
        return throwError(() => err);
      })
    );
  }

  /** POST /api/auth/oauth-login (Google GIS flow) */
  loginWithGoogle(): Observable<AuthResponse> {
    if (!isPlatformBrowser(this.platformId))
      return throwError(() => new Error('Google OAuth is only available in the browser.'));

    if (!environment.googleClientId)
      return throwError(() => new Error('Google client ID is missing in environment config.'));

    return from(this.getGoogleCredential(environment.googleClientId)).pipe(
      switchMap(({ idToken, profile }) => this.sendGoogleToken(idToken, profile)),
      catchError(err => {
        console.error('[AuthService] Google login error', err);
        return throwError(() => err);
      })
    );
  }

  /** Microsoft OAuth – backend redirect flow */
  loginWithMicrosoft(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.location.href = `${environment.apiUrl}/api/auth/oauth/microsoft`;
  }

  /**
   * POST /api/auth/refresh
   *
   * FIX: backend RefreshTokenRequestDto requires BOTH accessToken AND
   * refreshToken.  The old RefreshTokenRequest only sent refreshToken,
   * causing 400 validation errors on every refresh attempt.
   */
  refreshAccessToken(): Observable<AuthResponse> {
    const accessToken  = this.getRawAccessToken();
    const refreshToken = this.getRawRefreshToken();

    if (!refreshToken)
      return throwError(() => new Error('No refresh token found – user must log in again.'));

    // Send both — backend validates both fields as [Required]
    const payload: RefreshTokenRequest = {
      accessToken:  accessToken ?? '',
      refreshToken: refreshToken
    };

    return this.apiService.post<AuthResponse>('/api/auth/refresh', payload).pipe(
      tap(res => this.setSession(res)),
      catchError(err => {
        console.error('[AuthService] Token refresh failed – logging out', err);
        this.logout();
        return throwError(() => err);
      })
    );
  }

  /** POST /api/auth/forgot-password */
  forgotPassword(email: string): Observable<SimpleResponse> {
    const payload: ForgotPasswordRequest = { email };
    return this.apiService.post<SimpleResponse>('/api/auth/forgot-password', payload);
  }

  /** POST /api/auth/reset-password */
  resetPassword(token: string, newPassword: string): Observable<SimpleResponse> {
    const payload: ResetPasswordRequest = { token, newPassword };
    return this.apiService.post<SimpleResponse>('/api/auth/reset-password', payload);
  }

  /** GET /api/auth/verify-email?token=... */
  verifyEmail(token: string): Observable<SimpleResponse> {
    return this.apiService.get<SimpleResponse>(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`
    );
  }

  /** GET /api/auth/me — requires Bearer token (added by interceptor) */
  getMe(): Observable<{ id: string; name: string; email: string }> {
    return this.apiService.get('/api/auth/me');
  }

  /** Clear session and broadcast logged-out state */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.expiryKey);
      localStorage.removeItem(this.userKey);
    }
    this.loggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Token accessors — used by AuthInterceptor
  // ══════════════════════════════════════════════════════════════════════════

  /** Returns token only if not expired. Interceptor calls this proactively. */
  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    if (this.isTokenExpired()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  /** Raw token regardless of expiry — used by refresh logic */
  getRawAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return this.getRawRefreshToken();
  }

  isTokenExpired(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    const expiry = localStorage.getItem(this.expiryKey);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry, 10);
  }

  getCurrentUser(): UserDto | null {
    return this.currentUserSubject.value;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Private helpers
  // ══════════════════════════════════════════════════════════════════════════

  private sendGoogleToken(
    idToken: string,
    profile?: { email?: string; name?: string; picture?: string }
  ): Observable<AuthResponse> {
    const payload: OAuthLoginRequest = {
      provider: 'Google',
      idToken,
      email:          profile?.email ?? null,
      name:           profile?.name  ?? null,
      profilePicture: profile?.picture ?? null
    };
    return this.apiService.post<AuthResponse>('/api/auth/oauth-login', payload).pipe(
      tap(res => this.setSession(res))
    );
  }

  /**
   * Persists tokens + user to localStorage.
   *
   * FIX — handles both .NET PascalCase and Angular camelCase keys:
   *   .NET returns:  { "AccessToken": "...", "ExpiresAt": "...", "User": {...} }
   *   We read both:  raw.accessToken ?? raw.AccessToken
   *
   * This was the silent failure — setSession() found no accessToken key
   * and returned early, leaving the user in a logged-out state despite
   * the server returning 200 with valid tokens.
   */
  private setSession(response: AuthResponse): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = response as any;

    const accessToken  = raw.accessToken  ?? raw.AccessToken  ?? null;
    const refreshToken = raw.refreshToken ?? raw.RefreshToken ?? null;
    const expiresAt    = raw.expiresAt    ?? raw.ExpiresAt    ?? null;
    const user         = raw.user         ?? raw.User         ?? null;

    if (!accessToken) {
      console.warn('[AuthService] setSession: no accessToken in response — session NOT saved.', response);
      console.warn('[AuthService] Keys received:', Object.keys(raw));
      return;
    }

    localStorage.setItem(this.tokenKey, accessToken);

    if (refreshToken)
      localStorage.setItem(this.refreshTokenKey, refreshToken);

    // expiresAt is an ISO datetime string from the backend, not seconds
    if (expiresAt) {
      localStorage.setItem(this.expiryKey, String(new Date(expiresAt).getTime()));
    } else {
      // Fallback: 60 min from now
      localStorage.setItem(this.expiryKey, String(Date.now() + 60 * 60 * 1000));
    }

    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.currentUserSubject.next(user as UserDto);
    }

    this.loggedInSubject.next(true);
  }

  private hasValidToken(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!localStorage.getItem(this.tokenKey) && !this.isTokenExpired();
  }

  private loadStoredUser(): UserDto | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const stored = localStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) as UserDto : null;
    } catch { return null; }
  }

  private getRawRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.refreshTokenKey);
  }

  // ── Google Identity Services ──────────────────────────────────────────────

  private async getGoogleCredential(
    clientId: string
  ): Promise<{ idToken: string; profile: { email?: string; name?: string; picture?: string } }> {
    await this.loadGoogleScript();

    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gid = (window as any)?.google?.accounts?.id;
      if (!gid) {
        reject(new Error('Google Identity Services failed to initialize.'));
        return;
      }

      const timeoutId = window.setTimeout(
        () => reject(new Error('Google login timed out – prompt may have been suppressed.')),
        60_000
      );

      gid.initialize({
        client_id:            clientId,
        callback:             (res: { credential?: string }) => {
          window.clearTimeout(timeoutId);
          if (!res?.credential) { reject(new Error('Google did not return an ID token.')); return; }
          resolve({ idToken: res.credential, profile: this.parseJwtPayload(res.credential) });
        },
        cancel_on_tap_outside: true,
        ux_mode:              'popup'
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (gid.prompt as any)((n: any) => {
        if (n?.isNotDisplayed?.()) {
          window.clearTimeout(timeoutId);
          reject(new Error(`Google One Tap blocked: ${n.getNotDisplayedReason?.()}. Click Sign in with Google.`));
        } else if (n?.isSkippedMoment?.()) {
          window.clearTimeout(timeoutId);
          reject(new Error(`Google One Tap skipped: ${n.getSkippedReason?.()}. Click Sign in with Google.`));
        }
      });
    });
  }

  private loadGoogleScript(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.accounts?.id) return Promise.resolve();
    if (this.googleScriptLoadPromise) return this.googleScriptLoadPromise;

    this.googleScriptLoadPromise = new Promise<void>((resolve, reject) => {
      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) { resolve(); return; }
      const s  = document.createElement('script');
      s.src    = 'https://accounts.google.com/gsi/client';
      s.async  = true;
      s.defer  = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Google Identity Services script.'));
      document.head.appendChild(s);
    });

    return this.googleScriptLoadPromise;
  }

  private parseJwtPayload(token: string): { email?: string; name?: string; picture?: string } {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return { email: decoded.email, name: decoded.name, picture: decoded.picture };
    } catch { return {}; }
  }
}