import {
  Injectable,
  inject,
  PLATFORM_ID,
  TransferState,
  makeStateKey
}                              from '@angular/core';
import { isPlatformBrowser }   from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of }      from 'rxjs';
import { tap }                 from 'rxjs/operators';
import { environment }         from '../../../environments/environment';

/**
 * Central HTTP service — all API calls go through here.
 *
 * ── Why TransferState? ────────────────────────────────────────────────────
 * Without it, the SSR lifecycle is:
 *   1. Server fetches GET /api/Customer → fails (self-signed cert) → error
 *   2. Browser receives broken HTML, re-fetches → succeeds after delay
 *   Result: "Loading customers..." hangs, then error flash, then data loads
 *
 * With TransferState:
 *   1. Server fetches GET /api/Customer → succeeds (TLS fix applied) →
 *      stores result in the HTML payload sent to browser
 *   2. Browser reads cached result from HTML — NO second HTTP call
 *   Result: customers appear instantly, zero loading delay
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http          = inject(HttpClient);
  private readonly platformId    = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  private readonly baseUrl       = environment.apiUrl;

  private get defaultHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  get<T>(path: string): Observable<T> {
    const key = makeStateKey<T>(`GET:${path}`);

    // Browser: return SSR-cached result if available, skip HTTP call
    if (isPlatformBrowser(this.platformId)) {
      const cached = this.transferState.get<T | null>(key, null);
      if (cached !== null) {
        this.transferState.remove(key);   // consume — don't reuse stale data
        return of(cached);
      }
    }

    return this.http
      .get<T>(`${this.baseUrl}${path}`, { headers: this.defaultHeaders })
      .pipe(
        tap(data => {
          // Server: store in transfer state so browser can read from HTML
          if (!isPlatformBrowser(this.platformId)) {
            this.transferState.set(key, data);
          }
        })
      );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, {
      headers: this.defaultHeaders
    });
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, {
      headers: this.defaultHeaders
    });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, {
      headers: this.defaultHeaders
    });
  }
}