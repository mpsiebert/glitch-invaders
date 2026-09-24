import { describe, it, expect, vi } from 'vitest';
import { getStationId, getInactivityTimeout } from '../environment';

describe('environment', () => {
  it('isDemoMode() returns true when VITE_SENTRY_DSN is not set', async () => {
    // Dynamically import with a clean module to test demo mode behavior
    // The function checks import.meta.env.VITE_SENTRY_DSN
    const originalDsn = import.meta.env.VITE_SENTRY_DSN;
    import.meta.env.VITE_SENTRY_DSN = '';
    const { isDemoMode } = await import('../environment');
    // In test env with no DSN set, should be demo mode
    expect(isDemoMode()).toBe(true);
    // Restore
    if (originalDsn) {
      import.meta.env.VITE_SENTRY_DSN = originalDsn;
    }
  });

  it('getStationId() returns "arcade-01" by default', () => {
    expect(getStationId()).toBe('arcade-01');
  });

  it('getInactivityTimeout() returns 180000 by default', () => {
    expect(getInactivityTimeout()).toBe(180000);
  });
});
