export class InputManager {
  private keys = new Set<string>();
  private handleKeyDown: (e: KeyboardEvent) => void;
  private handleKeyUp: (e: KeyboardEvent) => void;
  private handleBlur: () => void;
  private handleVisibilityChange: () => void;

  constructor() {
    this.handleKeyDown = (e: KeyboardEvent) => {
      const key = this.normalizeKey(e.key);
      if (key) {
        this.keys.add(key);
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
          e.preventDefault();
        }
      }
    };
    this.handleKeyUp = (e: KeyboardEvent) => {
      const key = this.normalizeKey(e.key);
      if (key) this.keys.delete(key);
    };
    this.handleBlur = () => {
      this.clearAll();
    };
    this.handleVisibilityChange = () => {
      if (document.hidden) this.clearAll();
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private normalizeKey(key: string): string | null {
    switch (key) {
      case 'ArrowLeft': case 'a': case 'A': return 'left';
      case 'ArrowRight': case 'd': case 'D': return 'right';
      case 'ArrowUp': case 'w': case 'W': return 'up';
      case 'ArrowDown': case 's': case 'S': return 'down';
      case ' ': case 'Enter': return 'fire';
      default: return null;
    }
  }

  isDown(key: string): boolean { return this.keys.has(key); }
  simulateKeyDown(key: string): void { this.keys.add(key); }
  simulateKeyUp(key: string): void { this.keys.delete(key); }
  clearAll(): void { this.keys.clear(); }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.keys.clear();
  }
}
