import type { BountyDefinition } from '../../types';
import { reportBountyLogicError } from '../../sentry/reporting';
import { addGameBreadcrumb, setGameContext } from '../../sentry/telemetry';

// ═══════════════════════════════════════════════════════
// INTENTIONAL BUG SITE: Friendly Fire (Bounty 2)
// Shield MULTIPLIES damage ×3 instead of absorbing it.
// ═══════════════════════════════════════════════════════

let shieldBugActive = true;

export function calculateShieldDamage(
  shieldActive: boolean, incomingDamage: number
): { actualDamage: number; shieldConsumed: boolean } {
  if (!shieldActive) return { actualDamage: incomingDamage, shieldConsumed: false };
  if (shieldBugActive) {
    return { actualDamage: incomingDamage * 3, shieldConsumed: true }; // BUG
  } else {
    return { actualDamage: 0, shieldConsumed: true }; // FIXED
  }
}

export function handleFriendlyFireBug(
  runId: string,
  diagnostics: { shieldActive: boolean; incomingDamage: number; actualDamage: number; healthBefore: number; healthAfter: number }
): string | null {
  addGameBreadcrumb('game.shield', 'Shield collected', { type: 'shield' });
  addGameBreadcrumb('game.shield', 'Shield enabled', { shieldActive: true });
  addGameBreadcrumb('game.combat', `Incoming damage: ${diagnostics.incomingDamage}`, { damage: diagnostics.incomingDamage });
  addGameBreadcrumb('game.shield', `Shield active: ${diagnostics.shieldActive}`, { shieldActive: diagnostics.shieldActive });
  addGameBreadcrumb('game.combat', `Actual damage applied: ${diagnostics.actualDamage}`, { actualDamage: diagnostics.actualDamage, expected: 0 });
  addGameBreadcrumb('game.combat', 'Ship destroyed — shield failed to protect', { healthBefore: diagnostics.healthBefore, healthAfter: diagnostics.healthAfter });

  setGameContext('shield_state', {
    shieldActive: diagnostics.shieldActive, incomingDamage: diagnostics.incomingDamage,
    actualDamage: diagnostics.actualDamage, healthBefore: diagnostics.healthBefore,
    healthAfter: diagnostics.healthAfter, expected: 'Shield should absorb damage (actualDamage should be 0)',
  });

  return reportBountyLogicError(
    'friendly-fire',
    `Invalid shield state: shield was active but damage was ${diagnostics.actualDamage} (expected 0). Ship destroyed despite active shield.`,
    runId, diagnostics
  );
}

export function applyRepair(repairId: number): boolean {
  if (repairId === 0) { shieldBugActive = false; return true; }
  return false;
}

export function isRepairCorrect(repairId: number): boolean { return repairId === 0; }
export function resetBug(): void { shieldBugActive = true; }

export const FRIENDLY_FIRE_DEFINITION: BountyDefinition = {
  id: 'friendly-fire',
  title: 'Friendly Fire',
  tagline: 'Your shield just made things worse.',
  discoveryMessage:
    'You picked up a shield, but it made you MORE vulnerable! An enemy hit destroyed your ship despite having an active shield. A diagnostic report was sent to Sentry.',
  evidenceQuestion: 'Was the shield active when the lethal damage was applied?',
  acceptedAnswers: ['yes', 'true', 'active', 'it was active', 'yes it was', 'yes, it was active', 'the shield was active', 'shield was active'],
  wrongAnswerHint: 'Look at the diagnostics context in Sentry — check the shield_state section. Was shieldActive true or false?',
  repairs: [
    {
      id: 0, title: 'Shield absorbs damage completely', isCorrect: true,
      description: 'When shield is active, set actual damage to 0 and consume the shield.',
      codeSnippet: `if (shieldActive) {\n  actualDamage = 0;\n  shieldConsumed = true;\n}`,
      successExplanation: 'Excellent patch! Setting actualDamage to 0 guarantees that the shield absorbs 100% of the incoming hit before being consumed.',
    },
    {
      id: 1, title: 'Remove the damage multiplier', isCorrect: false,
      description: 'Remove the ×3 multiplier so damage passes through normally.',
      codeSnippet: `if (shieldActive) {\n  actualDamage = incomingDamage;\n}`,
      incorrectFeedback: 'Removing the ×3 multiplier stops amplified damage, but damage still passes straight through to player health! A shield must absorb damage completely (damage = 0).',
    },
    {
      id: 2, title: 'Deactivate the shield on hit', isCorrect: false,
      description: 'Turn off the shield when hit, but still apply full damage.',
      codeSnippet: `if (shieldActive) {\n  shieldActive = false;\n  actualDamage = incomingDamage;\n}`,
      incorrectFeedback: 'Turning off the shield doesn\'t protect the player! The ship still takes full incoming damage upon impact.',
    },
  ],
  hints: [
    'Check the breadcrumbs in Sentry — they show the sequence of events. Look at the shield state.',
    'In the Sentry issue detail, open the "shield_state" context section. It shows whether shieldActive was true or false.',
    'The answer is "yes" — the shield WAS active (shieldActive: true), but damage was 3 instead of 0. Enter "yes" below.',
  ],
  isOptional: false,
};
