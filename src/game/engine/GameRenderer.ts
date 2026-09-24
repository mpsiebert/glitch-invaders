import type {
  PlayerState,
  EnemyState,
  ProjectileState,
  PowerUpState,
  BossState
} from '../../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS
} from '../../config/constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
  }

  public render(state: {
    player: PlayerState;
    enemies: EnemyState[];
    projectiles: ProjectileState[];
    powerUps: PowerUpState[];
    boss: BossState | null;
    particles: { x: number; y: number; life: number; color: string }[];
  }): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Starfield
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 50; i++) {
      const sx = (i * 137.5 + Date.now() * 0.001 * ((i % 3) + 1)) % CANVAS_WIDTH;
      const sy = (i * 97.3) % CANVAS_HEIGHT;
      ctx.fillRect(sx, sy, 1, 1);
    }

    this.renderEnemies(state.enemies);
    this.renderProjectiles(state.projectiles);
    this.renderPowerUps(state.powerUps);
    this.renderPlayer(state.player);
    this.renderBoss(state.boss);
    this.renderParticles(state.particles);
  }

  private renderPlayer(p: PlayerState): void {
    const ctx = this.ctx;
    if (p.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) return;

    if (p.shieldActive) {
      ctx.strokeStyle = COLORS.playerShield; ctx.lineWidth = 2; ctx.shadowColor = COLORS.playerShield; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.ellipse(p.position.x + p.size.x / 2, p.position.y + p.size.y / 2, p.size.x * 0.75, p.size.y * 0.75, 0, 0, Math.PI * 2);
      ctx.stroke(); ctx.shadowBlur = 0;
    }

    ctx.fillStyle = COLORS.player; ctx.shadowColor = COLORS.player; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(p.position.x + p.size.x / 2, p.position.y); ctx.lineTo(p.position.x, p.position.y + p.size.y); ctx.lineTo(p.position.x + p.size.x, p.position.y + p.size.y); ctx.closePath();
    ctx.fill(); ctx.shadowBlur = 0;

    ctx.fillStyle = '#ff8800';
    ctx.fillRect(p.position.x + p.size.x / 2 - 4, p.position.y + p.size.y, 8, 4 + Math.random() * 4);
  }

  private renderEnemies(enemies: EnemyState[]): void {
    const ctx = this.ctx;
    const time = Date.now() * 0.005;

    for (const e of enemies) {
      if (!e.active) continue;
      const { x, y } = e.position;
      const { x: w, y: h } = e.size;
      const row = e.row % 4;

      switch (row) {
        case 0:
          this.drawLadybug(ctx, x, y, w, h, time);
          break;
        case 1:
          this.drawHoneybee(ctx, x, y, w, h, time);
          break;
        case 2:
          this.drawBeetle(ctx, x, y, w, h, time);
          break;
        default:
          this.drawSpider(ctx, x, y, w, h, time);
          break;
      }

      if (e.type === 'armored' && e.health < e.maxHealth) {
        ctx.fillStyle = COLORS.projectileEnemy;
        ctx.fillRect(x, y - 4, w * (e.health / e.maxHealth), 2);
      }
    }
  }

  // Row 0: Ladybug 🐞
  private drawLadybug(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, time: number): void {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const legOffset = Math.sin(time + x) * 2;

    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.5;
    // Legs
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 3); ctx.lineTo(cx - 14, cy - 6 + legOffset);
    ctx.moveTo(cx + 8, cy - 3); ctx.lineTo(cx + 14, cy - 6 - legOffset);
    ctx.moveTo(cx - 8, cy + 3); ctx.lineTo(cx - 14, cy + 6 + legOffset);
    ctx.moveTo(cx + 8, cy + 3); ctx.lineTo(cx + 14, cy + 6 - legOffset);
    ctx.stroke();

    // Antennae
    ctx.beginPath();
    ctx.moveTo(cx - 3, y + 4); ctx.lineTo(cx - 6, y - 1);
    ctx.moveTo(cx + 3, y + 4); ctx.lineTo(cx + 6, y - 1);
    ctx.stroke();

    // Red Shell
    ctx.fillStyle = '#ff3344';
    ctx.shadowColor = '#ff3344';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, w * 0.42, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Center Line & Head
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 1, cy - 4, 2, h * 0.7);
    ctx.beginPath();
    ctx.arc(cx, y + 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Black Spots
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx - 6, cy, 2, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy, 2, 0, Math.PI * 2);
    ctx.arc(cx - 4, cy + 6, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy + 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Row 1: Honeybee 🐝
  private drawHoneybee(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, time: number): void {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const wingFlap = Math.sin(time * 3 + x) * 0.3;

    // Translucent Wings
    ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy - 4, 8, 4, -0.4 + wingFlap, 0, Math.PI * 2);
    ctx.ellipse(cx + 8, cy - 4, 8, 4, 0.4 - wingFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Striped Body
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, w * 0.38, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Black Stripes
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 10, cy - 2, 20, 3);
    ctx.fillRect(cx - 8, cy + 3, 16, 3);

    // Stinger
    ctx.beginPath();
    ctx.moveTo(cx - 2, y + h - 2); ctx.lineTo(cx + 2, y + h - 2); ctx.lineTo(cx, y + h + 2);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(cx - 5, cy - 6, 3, 3);
    ctx.fillRect(cx + 2, cy - 6, 3, 3);
  }

  // Row 2: Armored Beetle 🪲
  private drawBeetle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, time: number): void {
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Pincers / Horns
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 4, y + 4); ctx.lineTo(cx - 8, y - 2); ctx.lineTo(cx - 5, y - 4);
    ctx.moveTo(cx + 4, y + 4); ctx.lineTo(cx + 8, y - 2); ctx.lineTo(cx + 5, y - 4);
    ctx.stroke();

    // Metallic Green Shell
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(cx - 12, cy - 4, 24, 18, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Shell Carapace Details
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(cx - 1, cy - 4, 2, 18);
    ctx.fillRect(cx - 9, cy, 5, 4);
    ctx.fillRect(cx + 4, cy, 5, 4);

    // Glowing Eyes
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(cx - 7, y + 3, 3, 2);
    ctx.fillRect(cx + 4, y + 3, 3, 2);
  }

  // Row 3: Neon Spider 🕷️
  private drawSpider(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, time: number): void {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const legWiggle = Math.cos(time * 2 + x) * 2;

    // 8 Legs
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    // Left legs
    ctx.moveTo(cx - 4, cy - 2); ctx.lineTo(cx - 12, cy - 8 + legWiggle);
    ctx.moveTo(cx - 4, cy); ctx.lineTo(cx - 14, cy - 2 - legWiggle);
    ctx.moveTo(cx - 4, cy + 2); ctx.lineTo(cx - 14, cy + 4 + legWiggle);
    ctx.moveTo(cx - 4, cy + 4); ctx.lineTo(cx - 12, cy + 10 - legWiggle);
    // Right legs
    ctx.moveTo(cx + 4, cy - 2); ctx.lineTo(cx + 12, cy - 8 - legWiggle);
    ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 14, cy - 2 + legWiggle);
    ctx.moveTo(cx + 4, cy + 2); ctx.lineTo(cx + 14, cy + 4 - legWiggle);
    ctx.moveTo(cx + 4, cy + 4); ctx.lineTo(cx + 12, cy + 10 + legWiggle);
    ctx.stroke();

    // Body & Abdomen
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 4, 0, Math.PI * 2);
    ctx.arc(cx, cy + 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing Eyes
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(cx - 3, cy - 5, 2, 2);
    ctx.fillRect(cx + 1, cy - 5, 2, 2);
  }

  private renderProjectiles(projectiles: ProjectileState[]): void {
    const ctx = this.ctx;
    for (const p of projectiles) {
      if (!p.active) continue;
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6;
      ctx.fillRect(p.position.x, p.position.y, p.size.x, p.size.y); ctx.shadowBlur = 0;
    }
  }

  private renderPowerUps(powerUps: PowerUpState[]): void {
    const ctx = this.ctx;
    for (const pu of powerUps) {
      if (!pu.active) continue;
      ctx.fillStyle = pu.color; ctx.shadowColor = pu.color; ctx.shadowBlur = 10;

      const cx = pu.position.x + pu.size.x / 2; const cy = pu.position.y + pu.size.y / 2;
      const r = pu.size.x / 2; const angle = Date.now() * 0.003;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.lineTo(cx + Math.cos(angle + Math.PI / 2) * r * 0.6, cy + Math.sin(angle + Math.PI / 2) * r * 0.6);
      ctx.lineTo(cx + Math.cos(angle + Math.PI) * r, cy + Math.sin(angle + Math.PI) * r);
      ctx.lineTo(cx + Math.cos(angle + 3 * Math.PI / 2) * r * 0.6, cy + Math.sin(angle + 3 * Math.PI / 2) * r * 0.6);
      ctx.closePath(); ctx.fill();

      ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      const label = pu.type === 'tripleShot' ? '3×' : pu.type === 'shield' ? '🛡' : '⚡';
      ctx.fillText(label, cx, cy + 3);
    }
  }

  // Boss: Queen Hornet / Cyber Beetle 👑
  private renderBoss(boss: BossState | null): void {
    const ctx = this.ctx;
    if (!boss || !boss.active) return;
    const { x, y } = boss.position;
    const { x: w, y: h } = boss.size;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const time = Date.now() * 0.008;
    const wingFlap = Math.sin(time * 3) * 6;

    // Massive Glowing Cyber Wings
    ctx.fillStyle = 'rgba(255, 0, 255, 0.4)';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(cx - 30, cy - 10, 35, 12 + wingFlap, -0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + 30, cy - 10, 35, 12 - wingFlap, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Giant Body
    ctx.fillStyle = COLORS.boss;
    ctx.shadowColor = COLORS.boss;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.4, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Crown / Horn Mandibles
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx - 15, y + 10); ctx.lineTo(cx - 25, y - 8); ctx.lineTo(cx - 10, y + 2);
    ctx.moveTo(cx + 15, y + 10); ctx.lineTo(cx + 25, y - 8); ctx.lineTo(cx + 10, y + 2);
    ctx.moveTo(cx - 5, y + 5); ctx.lineTo(cx, y - 10); ctx.lineTo(cx + 5, y + 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Compound Eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 8, 8, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Cyber Abdomen Stripes
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 20, cy + 5, 40, 4);
    ctx.fillRect(cx - 15, cy + 13, 30, 4);

    // Health Bar
    const barWidth = w; const barHeight = 6; const barY = y - 16;
    ctx.fillStyle = '#333'; ctx.fillRect(x, barY, barWidth, barHeight);
    ctx.fillStyle = COLORS.boss; ctx.fillRect(x, barY, barWidth * (boss.health / boss.maxHealth), barHeight);
  }

  private renderParticles(particles: { x: number; y: number; life: number; color: string }[]): void {
    const ctx = this.ctx;
    for (const p of particles) {
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;
  }
}
