import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSentryTraceUrl, getTraceInvestigateUrl, getSentryEventUrl } from '../links';

describe('Sentry Links', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://fake@sentry.io/123');
    vi.stubEnv('VITE_SENTRY_ORG', 'test-org');
    vi.stubEnv('VITE_SENTRY_PROJECT', 'test-project');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('getSentryTraceUrl constructs correct performance trace URL with traceId', () => {
    const url = getSentryTraceUrl('trace-12345');
    expect(url).toBe('https://test-org.sentry.io/performance/trace/trace-12345/');
  });

  it('getTraceInvestigateUrl uses traceId when provided', () => {
    const res = getTraceInvestigateUrl('boss-buffering', 'run-abc', 'trace-999');
    expect(res).toEqual({
      url: 'https://test-org.sentry.io/performance/trace/trace-999/',
      isFallback: false,
    });
  });

  it('getSentryEventUrl constructs search URL with eventId and 14d statsPeriod', () => {
    const url = getSentryEventUrl('event-777');
    expect(url).toBe('https://test-org.sentry.io/issues/?query=event-777&statsPeriod=14d');
  });

  it('returns null in demo mode when DSN is empty', () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    expect(getSentryTraceUrl('trace-123')).toBeNull();
  });
});
