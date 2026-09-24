import type { BountyId, BountyState } from '../../types';
import { addGameBreadcrumb } from '../../sentry/telemetry';
import { TRIPLE_TROUBLE_DEFINITION } from './tripleTrouble';
import { FRIENDLY_FIRE_DEFINITION } from './friendlyFire';
import { BOSS_BUFFERING_DEFINITION } from './bossBuffering';
import * as tripleTrouble from './tripleTrouble';
import * as friendlyFire from './friendlyFire';
import * as bossBuffering from './bossBuffering';

export const BOUNTY_DEFINITIONS = {
  'triple-trouble': TRIPLE_TROUBLE_DEFINITION,
  'friendly-fire': FRIENDLY_FIRE_DEFINITION,
  'boss-buffering': BOSS_BUFFERING_DEFINITION,
} as const;

export function createInitialBounties(): Record<BountyId, BountyState> {
  return {
    'triple-trouble': {
      id: 'triple-trouble', phase: 'active', eventId: null, traceId: null,
      hintsUsed: 0, repairAttempts: 0, selectedRepair: null, isOptional: false,
    },
    'friendly-fire': {
      id: 'friendly-fire', phase: 'locked', eventId: null, traceId: null,
      hintsUsed: 0, repairAttempts: 0, selectedRepair: null, isOptional: false,
    },
    'boss-buffering': {
      id: 'boss-buffering', phase: 'locked', eventId: null, traceId: null,
      hintsUsed: 0, repairAttempts: 0, selectedRepair: null, isOptional: true,
    },
  };
}

export function getNextActiveBounty(bounties: Record<BountyId, BountyState>): BountyId | null {
  const order: BountyId[] = ['triple-trouble', 'friendly-fire', 'boss-buffering'];
  for (const id of order) {
    if (bounties[id].phase !== 'completed') return id;
  }
  return null;
}

export function applyBountyRepair(bountyId: BountyId, repairId: number): boolean {
  addGameBreadcrumb('game.repair', `Applying repair ${repairId} for ${bountyId}`, { bountyId, repairId });
  switch (bountyId) {
    case 'triple-trouble': return tripleTrouble.applyRepair(repairId);
    case 'friendly-fire': return friendlyFire.isRepairCorrect(repairId) ? (friendlyFire.applyRepair(repairId), true) : false;
    case 'boss-buffering': return bossBuffering.isRepairCorrect(repairId) ? (bossBuffering.applyRepair(repairId), true) : false;
  }
}

export function resetAllBugs(): void {
  tripleTrouble.resetBug();
  friendlyFire.resetBug();
  bossBuffering.resetBug();
}
