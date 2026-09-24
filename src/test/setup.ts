import { vi } from 'vitest';

// Mock AudioContext
class MockAudioContext {
  createGain() { return { connect: vi.fn(), gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } }; }
  createOscillator() { return { type: 'sine', frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }; }
  currentTime = 0;
  destination = {};
}
(window as any).AudioContext = MockAudioContext;
(window as any).webkitAudioContext = MockAudioContext;

// Mock rAF
window.requestAnimationFrame = vi.fn();
window.cancelAnimationFrame = vi.fn();

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn() as any;

// Set demo mode - ensure no Sentry DSN is set in tests
// This is handled by vitest.config.ts define or by the environment not having the var
