import type { BountyDefinition } from '../../types';
import { reportBountyError } from '../../sentry/reporting';
import { addGameBreadcrumb, setGameContext } from '../../sentry/telemetry';
import { WEAPON_CONFIGS, applyTripleTroubleRepair, resetWeaponConfigs } from '../weapons/weapons.config';

export function handleTripleTroubleError(error: Error, runId: string): string | null {
  addGameBreadcrumb('game.weapon', 'Weapon fire failed — configuration missing', {
    error: error.message, availableConfigs: Object.keys(WEAPON_CONFIGS),
  });
  setGameContext('weapon_state', {
    attemptedWeapon: 'triple', availableConfigs: Object.keys(WEAPON_CONFIGS), error: error.message,
  });
  return reportBountyError('triple-trouble', error, runId, {
    weapon_state: { attemptedWeapon: 'triple', availableConfigs: Object.keys(WEAPON_CONFIGS) },
  });
}

export function applyRepair(repairId: number): boolean {
  applyTripleTroubleRepair(repairId);
  const config = WEAPON_CONFIGS['triple'];
  return config !== undefined && config.projectileCount === 3 && config.fireRate > 0;
}

export function resetBug(): void { resetWeaponConfigs(); }

export const TRIPLE_TROUBLE_DEFINITION: BountyDefinition = {
  id: 'triple-trouble',
  title: 'Triple Trouble',
  tagline: 'Your weapon upgrade just broke everything.',
  discoveryMessage:
    'You collected a triple-shot power-up, but your weapon stopped firing! An error was captured in Sentry. Investigate the issue to find out what went wrong.',
  evidenceQuestion: 'Which weapon configuration was missing?',
  acceptedAnswers: ['triple', 'triple-shot', 'tripleshot', 'triple shot', '"triple"', "'triple'"],
  wrongAnswerHint: 'Look at the error message in Sentry — it tells you which weapon configuration was not found.',
  repairs: [
    {
      id: 0, title: 'Add the missing triple-shot config', isCorrect: true,
      description: 'Supply the complete weapon configuration with 3 projectiles, 15° spread, and a reasonable fire rate.',
      codeSnippet: `WEAPON_CONFIGS['triple'] = {\n  projectileCount: 3,\n  spread: 15,\n  fireRate: 300,\n  damage: 1,\n  color: '#ffaa00'\n};`,
    },
    {
      id: 1, title: 'Add a basic weapon config named triple', isCorrect: false,
      description: 'Register a weapon called "triple" but keep a single projectile — simpler is safer, right?',
      codeSnippet: `WEAPON_CONFIGS['triple'] = {\n  projectileCount: 1,\n  spread: 0,\n  fireRate: 200,\n  damage: 1,\n  color: '#ffaa00'\n};`,
    },
    {
      id: 2, title: 'Add triple config with instant fire rate', isCorrect: false,
      description: 'Three projectiles with zero delay between shots — maximum firepower!',
      codeSnippet: `WEAPON_CONFIGS['triple'] = {\n  projectileCount: 3,\n  spread: 15,\n  fireRate: 0,\n  damage: 1,\n  color: '#ffaa00'\n};`,
    },
  ],
  hints: [
    'The error message mentions exactly which configuration is missing. Look at the exception title in Sentry.',
    'In the Sentry issue detail, check the Exception section. The error message includes the weapon name that was not found.',
    'The answer is "triple". The error says: "Configuration missing for weapon: triple". Enter "triple" below.',
  ],
  isOptional: false,
};
