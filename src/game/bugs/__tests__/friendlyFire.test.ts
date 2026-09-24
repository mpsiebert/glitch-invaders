import { describe, it, expect, beforeEach } from 'vitest';
import { calculateShieldDamage, applyRepair, resetBug, isRepairCorrect } from '../friendlyFire';

describe('Friendly Fire Bug', () => {
  beforeEach(() => {
    resetBug();
  });

  it('calculateShieldDamage(true, 1) returns actualDamage=3 when bug active', () => {
    const result = calculateShieldDamage(true, 1);
    expect(result.actualDamage).toBe(3);
  });

  it('calculateShieldDamage(false, 1) returns actualDamage=1 always', () => {
    const result = calculateShieldDamage(false, 1);
    expect(result.actualDamage).toBe(1);
  });

  it('After applyRepair(0), calculateShieldDamage(true, 1) returns actualDamage=0', () => {
    applyRepair(0);
    const result = calculateShieldDamage(true, 1);
    expect(result.actualDamage).toBe(0);
  });

  it('applyRepair(1) returns false', () => {
    expect(applyRepair(1)).toBe(false);
  });

  it('resetBug() reactivates the bug', () => {
    applyRepair(0);
    resetBug();
    const result = calculateShieldDamage(true, 1);
    expect(result.actualDamage).toBe(3);
  });
});
