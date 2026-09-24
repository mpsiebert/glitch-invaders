import * as Sentry from '@sentry/react';
import { isDemoMode } from '../config/environment';
import type { BountyId } from '../types';

export function setRunTags(runId: string): void {
  if (isDemoMode()) {
    console.log(`[Demo] Setting run tags: run_id=${runId}`);
    return;
  }
  Sentry.setTag('run_id', runId);
}

export function addGameBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
): void {
  if (isDemoMode()) {
    console.log(`[Demo Breadcrumb] [${category}] ${message}`, data || '');
    return;
  }
  Sentry.addBreadcrumb({ category, message, level, data });
}

export function setGameContext(
  name: string,
  data: Record<string, unknown>
): void {
  if (isDemoMode()) {
    console.log(`[Demo Context] ${name}:`, data);
    return;
  }
  Sentry.setContext(name, data);
}

export function setBountyTag(bountyId: BountyId): void {
  if (isDemoMode()) return;
  Sentry.setTag('bounty_id', bountyId);
}
