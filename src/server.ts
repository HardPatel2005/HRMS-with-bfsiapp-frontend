import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse
}                           from '@angular/ssr/node';
import express              from 'express';
import { fileURLToPath }    from 'node:url';
import { dirname, resolve } from 'node:path';

// ── Dev-only: accept self-signed .NET cert during SSR HTTP calls ──────────
if (process.env['NODE_ENV'] !== 'production') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

const serverDistFolder  = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app    = express();
const engine = new AngularNodeAppEngine();

// ── FIX: Chrome DevTools CSP error ───────────────────────────────────────
// Chrome probes /.well-known/appspecific/com.chrome.devtools.json on every
// page load. If no response is given, it hits your CSP and logs a console
// error. Return an empty JSON object to satisfy Chrome silently.
// This route only exists in dev — in production the file isn't requested.
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.json({});
});

// ── Static browser assets ─────────────────────────────────────────────────
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index:  false,
  })
);

// ── All routes handled by Angular SSR ────────────────────────────────────
// '/*splat' required by path-to-regexp v8 (Express 5) — '/**' is invalid
app.get('/*splat', createNodeRequestHandler(async (req, res, next) => {
  try {
    const response = await engine.handle(req);
    if (response) {
      await writeResponseToNodeResponse(response, res);
    } else {
      next();
    }
  } catch (err: unknown) {
    next(err);
  }
}));

// ── Start ─────────────────────────────────────────────────────────────────
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);