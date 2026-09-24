import { getSentryConfig, isDemoMode, getFallbackUrl } from '../config/environment';
import type { BountyId } from '../types';

export function getSentryIssueUrl(runId: string, bountyId: BountyId): string | null {
  if (isDemoMode()) return null;
  const config = getSentryConfig();
  if (!config) return null;
  const query = encodeURIComponent(`run_id:${runId} bounty_id:${bountyId}`);
  return `https://${config.org}.sentry.io/issues/?query=${query}&statsPeriod=1h`;
}

export function getSentryEventUrl(eventId: string): string | null {
  if (isDemoMode()) return null;
  const config = getSentryConfig();
  if (!config) return null;
  return `https://${config.org}.sentry.io/issues/?query=${eventId}`;
}

export function getSentryTraceUrl(traceId: string | null): string | null {
  if (isDemoMode() || !traceId) return null;
  const config = getSentryConfig();
  if (!config) return null;
  return `https://${config.org}.sentry.io/performance/trace/${traceId}/`;
}

export function getInvestigateUrl(
  bountyId: BountyId, runId: string, eventId: string | null
): { url: string; isFallback: boolean } | null {
  // Tag-based search is the most reliable way to find the issue
  const searchUrl = getSentryIssueUrl(runId, bountyId);
  if (searchUrl) return { url: searchUrl, isFallback: false };
  
  const fallbackUrl = getFallbackUrl(bountyId);
  if (fallbackUrl) return { url: fallbackUrl, isFallback: true };
  return null;
}

export function getTraceInvestigateUrl(
  bountyId: BountyId, runId: string, traceId: string | null
): { url: string; isFallback: boolean } | null {
  const traceUrl = getSentryTraceUrl(traceId);
  if (traceUrl) return { url: traceUrl, isFallback: false };
  const fallbackUrl = getFallbackUrl(bountyId);
  if (fallbackUrl) return { url: fallbackUrl, isFallback: true };
  return null;
}
