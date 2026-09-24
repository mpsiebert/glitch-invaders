import { getInactivityTimeout } from '../config/environment';

export class InactivityMonitor {
  private lastActivity = Date.now();
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private warningTimeout: ReturnType<typeof setTimeout> | null = null;
  private onWarning: (() => void) | null = null;
  private onReset: (() => void) | null = null;
  private warningShown = false;
  private paused = false;

  private handleActivity = () => {
    this.lastActivity = Date.now();
    if (this.warningShown) {
      this.warningShown = false;
    }
  };

  start(onWarning: () => void, onReset: () => void): void {
    this.onWarning = onWarning;
    this.onReset = onReset;
    this.lastActivity = Date.now();

    window.addEventListener('keydown', this.handleActivity);
    window.addEventListener('mousemove', this.handleActivity);
    window.addEventListener('mousedown', this.handleActivity);
    window.addEventListener('touchstart', this.handleActivity);

    this.checkInterval = setInterval(() => this.check(), 5000);
  }

  private check(): void {
    if (this.paused) return;
    const elapsed = Date.now() - this.lastActivity;
    const timeout = getInactivityTimeout();

    if (!this.warningShown && elapsed > timeout) {
      this.warningShown = true;
      this.onWarning?.();

      this.warningTimeout = setTimeout(() => {
        if (this.warningShown) {
          this.onReset?.();
        }
      }, 30000);
    }
  }

  acknowledgePresence(): void {
    this.lastActivity = Date.now();
    this.warningShown = false;
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = null;
    }
  }

  pause(): void { this.paused = true; }
  resume(): void { this.paused = false; this.lastActivity = Date.now(); }

  destroy(): void {
    window.removeEventListener('keydown', this.handleActivity);
    window.removeEventListener('mousemove', this.handleActivity);
    window.removeEventListener('mousedown', this.handleActivity);
    window.removeEventListener('touchstart', this.handleActivity);

    if (this.checkInterval) { clearInterval(this.checkInterval); this.checkInterval = null; }
    if (this.warningTimeout) { clearTimeout(this.warningTimeout); this.warningTimeout = null; }
  }
}
