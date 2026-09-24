import * as Sentry from '@sentry/react';
import { getSentryConfig, isDemoMode } from './environment';
import { GAME_VERSION } from './constants';

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  initialized = true;

  if (isDemoMode()) {
    console.log(
      '%c[Glitch Invaders] Demo Mode — Sentry integration disabled',
      'color: #ffaa00; font-weight: bold'
    );
    return;
  }

  const config = getSentryConfig();
  if (!config) return;

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: `glitch-invaders@${GAME_VERSION}`,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });

  Sentry.setTag('station_id', config.stationId);
  Sentry.setTag('game_version', GAME_VERSION);
}

export function isSentryEnabled(): boolean {
  return !isDemoMode();
}
