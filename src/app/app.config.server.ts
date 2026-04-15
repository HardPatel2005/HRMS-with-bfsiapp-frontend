import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering }                    from '@angular/platform-server';
import { appConfig }                                 from './app.config';

// ── FIX 1: DEPTH_ZERO_SELF_SIGNED_CERT ───────────────────────────────────
// Node.js (SSR) rejects the self-signed certificate on https://localhost:44313
// during server-side HTTP calls, causing "Loading..." to hang indefinitely.
// This tells Node to accept self-signed certs — DEV ONLY.
// Never set this in production (use a real certificate there).
if (process.env['NODE_ENV'] !== 'production') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};

// Merges browser app.config with server-specific config
export const config = mergeApplicationConfig(appConfig, serverConfig);