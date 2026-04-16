import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering }                    from '@angular/ssr';
import { appConfig }                                 from './app.config';
import { withRoutes }                                from '@angular/ssr';
import { serverRoutes }                              from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

// Merges browser app.config with server-specific config
export const config = mergeApplicationConfig(appConfig, serverConfig);