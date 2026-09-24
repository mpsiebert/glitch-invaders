import * as Sentry from '@sentry/react';
import { isDemoMode } from '../config/environment';
import type { BountyId } from '../types';

const reportedBounties = new Set<string>();

export function reportBountyError(
  bountyId: BountyId,
  error: Error,
  runId: string,
  extraContext?: Record<string, Record<string, unknown>>
): string | null {
  const key = `${runId}:${bountyId}`;
  if (reportedBounties.has(key)) return null;
  reportedBounties.add(key);

  if (isDemoMode()) {
    const fakeId = `demo-${bountyId}-${Date.now().toString(36)}`;
    console.log(`[Demo] Would report error for ${bountyId}:`, error.message);
    return fakeId;
  }

  let eventId: string | null = null;
  Sentry.withScope((scope) => {
    scope.setFingerprint([runId, bountyId]);
    scope.setTag('bounty_id', bountyId);
    scope.setTag('run_id', runId);
    scope.setLevel('error');
    if (extraContext) {
      for (const [name, data] of Object.entries(extraContext)) {
        scope.setContext(name, data);
      }
    }
    eventId = Sentry.captureException(error);
  });
  return eventId;
}

export function reportBountyLogicError(
  bountyId: BountyId,
  message: string,
  runId: string,
  diagnostics: Record<string, unknown>
): string | null {
  const key = `${runId}:${bountyId}`;
  if (reportedBounties.has(key)) return null;
  reportedBounties.add(key);

  if (isDemoMode()) {
    const fakeId = `demo-${bountyId}-${Date.now().toString(36)}`;
    console.log(`[Demo] Would report logic error for ${bountyId}:`, message);
    return fakeId;
  }

  let eventId: string | null = null;
  Sentry.withScope((scope) => {
    scope.setFingerprint([runId, bountyId]);
    scope.setTag('bounty_id', bountyId);
    scope.setTag('run_id', runId);
    scope.setLevel('error');
    scope.setContext('diagnostics', diagnostics);
    const err = new Error(message);
    err.name = 'GameLogicError';
    eventId = Sentry.captureException(err);
  });
  return eventId;
}

export function clearReportedBounties(): void {
  reportedBounties.clear();
}

export function hasReportedBounty(bountyId: BountyId, runId: string): boolean {
  return reportedBounties.has(`${runId}:${bountyId}`);
}
