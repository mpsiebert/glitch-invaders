import { describe, it, expect, vi } from 'vitest';
import { getStationId, getInactivityTimeout, isDemoMode } from '../environment';

describe('environment', () => {
  it('isDemoMode() returns true when VITE_SENTRY_DSN is not set', () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    expect(isDemoMode()).toBe(true);
    vi.unstubAllEnvs();
  });

  it('getStationId() returns "arcade-01" by default', () => {
    expect(getStationId()).toBe('arcade-01');
  });

  it('getInactivityTimeout() returns 180000 by default', () => {
    expect(getInactivityTimeout()).toBe(180000);
  });
});
