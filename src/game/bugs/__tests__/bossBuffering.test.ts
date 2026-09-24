import { describe, it, expect, beforeEach } from 'vitest';
import { applyRepair, isRepairCorrect, resetBug } from '../bossBuffering';

describe('Boss Buffering Bug', () => {
  beforeEach(() => {
    resetBug();
  });

  it('applyRepair(0) returns true', () => {
    expect(applyRepair(0)).toBe(true);
  });

  it('applyRepair(1) returns false', () => {
    expect(applyRepair(1)).toBe(false);
  });

  it('isRepairCorrect(0) returns true', () => {
    expect(isRepairCorrect(0)).toBe(true);
  });

  it('isRepairCorrect(1) returns false', () => {
    expect(isRepairCorrect(1)).toBe(false);
  });

  it('resetBug() does not throw', () => {
    expect(() => resetBug()).not.toThrow();
  });
});
