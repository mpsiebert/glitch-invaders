import { describe, it, expect } from 'vitest';
import { createInitialBounties, getNextActiveBounty, resetAllBugs } from '../BugManager';

describe('BugManager', () => {
  it('createInitialBounties() returns expected initial states', () => {
    const bounties = createInitialBounties();
    expect(bounties['triple-trouble'].phase).toBe('active');
    expect(bounties['friendly-fire'].phase).toBe('locked');
    expect(bounties['boss-buffering'].phase).toBe('locked');
  });

  it('getNextActiveBounty() returns "triple-trouble" initially', () => {
    const bounties = createInitialBounties();
    expect(getNextActiveBounty(bounties)).toBe('triple-trouble');
  });

  it('getNextActiveBounty() returns "friendly-fire" after marking triple-trouble completed', () => {
    const bounties = createInitialBounties();
    bounties['triple-trouble'].phase = 'completed';
    expect(getNextActiveBounty(bounties)).toBe('friendly-fire');
  });

  it('getNextActiveBounty() returns null after all completed', () => {
    const bounties = createInitialBounties();
    bounties['triple-trouble'].phase = 'completed';
    bounties['friendly-fire'].phase = 'completed';
    bounties['boss-buffering'].phase = 'completed';
    expect(getNextActiveBounty(bounties)).toBeNull();
  });

  it('resetAllBugs() does not throw', () => {
    expect(() => resetAllBugs()).not.toThrow();
  });
});
