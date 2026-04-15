import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter }                                  from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS }                              from '@angular/common/http';
import { provideClientHydration }                         from '@angular/platform-browser';
import { provideAnimations }                              from '@angular/platform-browser/animations';
import { provideToastr }                                  from 'ngx-toastr';

import { routes }          from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // FIX 1: withFetch() uses the browser's native fetch API on the client.
    // On the server (SSR) Angular uses Node's fetch — which rejects
    // self-signed certs causing DEPTH_ZERO_SELF_SIGNED_CERT errors.
    // withInterceptorsFromDi() is required for class-based interceptors.
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),

    // FIX 2: provideClientHydration() tells Angular to skip SSR HTTP calls
    // for routes that load data on the client — prevents double-fetching
    // and the "Loading customers..." hang caused by SSR fetch failures.
    provideClientHydration(),

    // Auth interceptor — attaches Bearer token to every non-anonymous request
    {
      provide:  HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi:    true
    },

    // Toastr
    provideAnimations(),
    provideToastr({
      timeOut:            4000,
      positionClass:      'toast-top-right',
      preventDuplicates:  true,
      closeButton:        true
    })
  ]
};