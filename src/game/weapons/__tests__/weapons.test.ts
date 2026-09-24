import { describe, it, expect, beforeEach } from 'vitest';
import { WEAPON_CONFIGS, applyTripleTroubleRepair, resetWeaponConfigs } from '../weapons.config';
import { WeaponSystem } from '../WeaponSystem';
import { WeaponConfigError } from '../../../types';

describe('Weapons', () => {
  let weaponSystem: WeaponSystem;

  beforeEach(() => {
    resetWeaponConfigs();
    weaponSystem = new WeaponSystem();
  });

  it('WEAPON_CONFIGS does NOT contain "triple" by default', () => {
    expect(WEAPON_CONFIGS['triple']).toBeUndefined();
  });

  it('WEAPON_CONFIGS DOES contain "single"', () => {
    expect(WEAPON_CONFIGS['single']).toBeDefined();
  });

  it('applyTripleTroubleRepair(0) adds correct triple config', () => {
    applyTripleTroubleRepair(0);
    const config = WEAPON_CONFIGS['triple'];
    expect(config).toBeDefined();
    expect(config.projectileCount).toBe(3);
    expect(config.spread).toBe(15);
    expect(config.fireRate).toBe(300);
  });

  it('applyTripleTroubleRepair(1) adds wrong config', () => {
    applyTripleTroubleRepair(1);
    expect(WEAPON_CONFIGS['triple'].projectileCount).toBe(1);
  });

  it('applyTripleTroubleRepair(2) adds wrong config', () => {
    applyTripleTroubleRepair(2);
    expect(WEAPON_CONFIGS['triple'].fireRate).toBe(0);
  });

  it('resetWeaponConfigs() removes triple config', () => {
    applyTripleTroubleRepair(0);
    resetWeaponConfigs();
    expect(WEAPON_CONFIGS['triple']).toBeUndefined();
  });

  it('WeaponSystem.fire throws WeaponConfigError for nonexistent weapon', () => {
    expect(() => weaponSystem.fire('nonexistent', 0, 0, 10)).toThrow(WeaponConfigError);
  });

  it('WeaponSystem.fire("triple") returns 3 projectiles after repair', () => {
    applyTripleTroubleRepair(0);
    const projectiles = weaponSystem.fire('triple', 0, 0, 10);
    expect(projectiles.length).toBe(3);
  });
});
