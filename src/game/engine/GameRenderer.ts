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
      ctx.strokeStyle = COLORS.playerShield; ctx.lineWidth = 2; ctx.shadowColor = COLORS.playerShield; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.ellipse(p.position.x + p.size.x / 2, p.position.y + p.size.y / 2, p.size.x * 0.7, p.size.y * 0.7, 0, 0, Math.PI * 2);
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
    for (const e of enemies) {
      if (!e.active) continue;
      const color = COLORS.enemyRow[e.row % COLORS.enemyRow.length];
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 6;

      const { x, y } = e.position; const { x: w, y: h } = e.size;
      ctx.fillRect(x + w * 0.2, y, w * 0.6, h * 0.3); ctx.fillRect(x, y + h * 0.3, w, h * 0.4);
      ctx.fillRect(x + w * 0.1, y + h * 0.7, w * 0.25, h * 0.3); ctx.fillRect(x + w * 0.65, y + h * 0.7, w * 0.25, h * 0.3);

      ctx.fillStyle = COLORS.background;
      ctx.fillRect(x + w * 0.25, y + h * 0.35, w * 0.15, h * 0.15); ctx.fillRect(x + w * 0.6, y + h * 0.35, w * 0.15, h * 0.15);

      if (e.type === 'armored' && e.health < e.maxHealth) {
        ctx.fillStyle = COLORS.projectileEnemy; ctx.fillRect(x, y - 4, w * (e.health / e.maxHealth), 2);
      }
      ctx.shadowBlur = 0;
    }
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

  private renderBoss(boss: BossState | null): void {
    const ctx = this.ctx;
    if (!boss || !boss.active) return;
    ctx.fillStyle = COLORS.boss; ctx.shadowColor = COLORS.boss; ctx.shadowBlur = 15;
    const { x, y } = boss.position; const { x: w, y: h } = boss.size;

    ctx.fillRect(x + w * 0.1, y, w * 0.8, h * 0.6); ctx.fillRect(x, y + h * 0.2, w, h * 0.3);
    ctx.fillRect(x + w * 0.15, y + h * 0.6, w * 0.2, h * 0.4); ctx.fillRect(x + w * 0.65, y + h * 0.6, w * 0.2, h * 0.4);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + w * 0.25, y + h * 0.15, w * 0.15, h * 0.2); ctx.fillRect(x + w * 0.6, y + h * 0.15, w * 0.15, h * 0.2);
    ctx.shadowBlur = 0;

    const barWidth = w; const barHeight = 6; const barY = y - 12;
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
