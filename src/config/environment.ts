import type { SentryConfig } from '../types';

export function isDemoMode(): boolean {
  return !import.meta.env.VITE_SENTRY_DSN;
}

export function getSentryConfig(): SentryConfig | null {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const org = import.meta.env.VITE_SENTRY_ORG;
  const project = import.meta.env.VITE_SENTRY_PROJECT;
  if (!dsn || !org || !project) return null;
  return {
    dsn,
    org,
    project,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    stationId: import.meta.env.VITE_STATION_ID || 'arcade-01',
  };
}

export function getStationId(): string {
  return import.meta.env.VITE_STATION_ID || 'arcade-01';
}

export function getInactivityTimeout(): number {
  const val = import.meta.env.VITE_INACTIVITY_TIMEOUT_MS;
  return val ? parseInt(val, 10) : 180000;
}

export function getFallbackUrl(bountyId: string): string | null {
  const map: Record<string, string | undefined> = {
    'triple-trouble': import.meta.env.VITE_FALLBACK_BOUNTY1_URL,
    'friendly-fire': import.meta.env.VITE_FALLBACK_BOUNTY2_URL,
    'boss-buffering': import.meta.env.VITE_FALLBACK_BOUNTY3_URL,
  };
  return map[bountyId] || null;
}
