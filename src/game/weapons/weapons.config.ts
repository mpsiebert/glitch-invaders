import type { WeaponConfig } from '../../types';

// ═══════════════════════════════════════════════════════
// INTENTIONAL BUG SITE: Triple Trouble (Bounty 1)
// The 'triple' weapon configuration is deliberately absent.
// ═══════════════════════════════════════════════════════

export const WEAPON_CONFIGS: Record<string, WeaponConfig> = {
  single: { projectileCount: 1, spread: 0, fireRate: 200, damage: 1, color: '#00ffff' },
  // BUG: 'triple' config intentionally missing!
};

export function applyTripleTroubleRepair(repairId: number): void {
  switch (repairId) {
    case 0: // ✅ CORRECT
      WEAPON_CONFIGS['triple'] = { projectileCount: 3, spread: 15, fireRate: 300, damage: 1, color: '#ffaa00' };
      break;
    case 1: // ❌ WRONG: single shot
      WEAPON_CONFIGS['triple'] = { projectileCount: 1, spread: 0, fireRate: 200, damage: 1, color: '#ffaa00' };
      break;
    case 2: // ❌ WRONG: fire rate 0
      WEAPON_CONFIGS['triple'] = { projectileCount: 3, spread: 15, fireRate: 0, damage: 1, color: '#ffaa00' };
      break;
  }
}

export function resetWeaponConfigs(): void {
  delete WEAPON_CONFIGS['triple'];
}
