import { RenderMode, ServerRoute } from '@angular/ssr';

// ── Why different render modes matter ────────────────────────────────────
//
// RenderMode.Prerender  — HTML is built at BUILD TIME (static file)
//   Use for: login, register — content never changes, fastest possible load
//   Benefit: served from CDN/static cache, zero server processing per request
//
// RenderMode.Server     — HTML is built at REQUEST TIME on the Node server
//   Use for: all authenticated routes — content is user-specific
//   Benefit: fresh data per request, works with authGuard
//   Note: authGuard runs on server too — if no token in SSR context the
//         guard redirects, which is correct behaviour
//
// RenderMode.Client     — No SSR, pure browser rendering (SPA behaviour)
//   Use for: highly interactive pages where SSR adds no value
//   We don't use this here — Server mode is fine for all protected routes

export const serverRoutes: ServerRoute[] = [
  // Public pages — prerendered at build time, blazing fast
  { path: 'login',    renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },

  // Authenticated pages — server-rendered per request
  // These need Server mode because content is user-specific and
  // the authGuard needs to run to redirect unauthenticated users
  { path: 'dashboard',    renderMode: RenderMode.Server },
  { path: 'customers',    renderMode: RenderMode.Server },
  { path: 'customers/**', renderMode: RenderMode.Server },
  { path: 'profile',      renderMode: RenderMode.Server },
  { path: 'utilities',    renderMode: RenderMode.Server },
  { path: 'utilities/**', renderMode: RenderMode.Server },
  { path: 'reports',      renderMode: RenderMode.Server },
  { path: 'reports/**',   renderMode: RenderMode.Server },
  { path: 'mf-investing',    renderMode: RenderMode.Server },
  { path: 'mf-investing/**', renderMode: RenderMode.Server },

  // Catch-all — Server mode for any unmatched routes
  { path: '**', renderMode: RenderMode.Server },
];