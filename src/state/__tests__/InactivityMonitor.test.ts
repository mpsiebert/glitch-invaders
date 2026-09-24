import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InactivityMonitor } from '../InactivityMonitor';

describe('InactivityMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Constructor does not throw', () => {
    expect(() => new InactivityMonitor()).not.toThrow();
  });

  it('destroy() does not throw', () => {
    const monitor = new InactivityMonitor();
    expect(() => monitor.destroy()).not.toThrow();
  });

  it('Use fake timers for timeout testing', () => {
    const monitor = new InactivityMonitor();
    const onWarning = vi.fn();
    const onReset = vi.fn();
    
    monitor.start(onWarning, onReset);
    
    // Advance time by 4 minutes (timeout is 3 min default)
    vi.advanceTimersByTime(240000);
    
    expect(onWarning).toHaveBeenCalled();
    
    monitor.destroy();
  });
});
