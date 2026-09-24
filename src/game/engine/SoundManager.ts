import type { SoundType } from '../../types';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private _muted = false;

  get muted() { return this._muted; }
  set muted(v: boolean) { this._muted = v; }

  private getContext(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  play(type: SoundType): void {
    if (this._muted) return;
    try {
      const ctx = this.getContext();
      switch (type) {
        case 'shoot': this.playTone(ctx, 880, 0.05, 'square', 0.15); break;
        case 'hit': this.playTone(ctx, 220, 0.1, 'sawtooth', 0.2); break;
        case 'explosion': this.playNoise(ctx, 0.3, 0.25); break;
        case 'powerUp': this.playArpeggio(ctx, [523, 659, 784], 0.08, 'square', 0.15); break;
        case 'shieldUp': this.playArpeggio(ctx, [392, 523, 659, 784], 0.06, 'sine', 0.12); break;
        case 'bossAlert': this.playArpeggio(ctx, [220, 196, 165, 147], 0.15, 'sawtooth', 0.3); break;
        case 'success': this.playArpeggio(ctx, [523, 659, 784, 1047], 0.1, 'square', 0.15); break;
        case 'fail': this.playArpeggio(ctx, [392, 349, 311, 262], 0.12, 'sawtooth', 0.2); break;
        case 'menuSelect': this.playTone(ctx, 660, 0.05, 'square', 0.1); break;
        case 'bugFound': this.playArpeggio(ctx, [440, 554, 440, 554, 440], 0.08, 'square', 0.2); break;
      }
    } catch { /* silently ignore audio errors */ }
  }

  private playTone(ctx: AudioContext, freq: number, duration: number, type: OscillatorType, volume: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  private playNoise(ctx: AudioContext, duration: number, volume: number) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(gain).connect(ctx.destination);
    source.start();
  }

  private playArpeggio(ctx: AudioContext, freqs: number[], noteLen: number, type: OscillatorType, volume: number) {
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + i * noteLen;
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteLen * 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + noteLen);
    });
  }

  destroy(): void {
    if (this.ctx) { this.ctx.close(); this.ctx = null; }
  }
}
