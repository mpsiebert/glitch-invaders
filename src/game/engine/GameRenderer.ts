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
    const isMlh = document.documentElement.getAttribute('data-theme') === 'mlh';

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (isMlh) {
      // MLH Mode: Flat Royal Blue canvas field
      ctx.fillStyle = '#1b40b8';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < CANVAS_WIDTH; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CANVAS_HEIGHT); ctx.stroke();
      }
      for (let gy = 0; gy < CANVAS_HEIGHT; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CANVAS_WIDTH, gy); ctx.stroke();
      }
    } else {
      // Classic Mode: Dark arcade space
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Starfield
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      for (let i = 0; i < 50; i++) {
        const sx = (i * 137.5 + Date.now() * 0.001 * ((i % 3) + 1)) % CANVAS_WIDTH;
        const sy = (i * 97.3) % CANVAS_HEIGHT;
        ctx.fillRect(sx, sy, 1, 1);
      }
    }

    this.renderEnemies(state.enemies, isMlh);
    this.renderProjectiles(state.projectiles, isMlh);
    this.renderPowerUps(state.powerUps, isMlh);
    this.renderPlayer(state.player, isMlh);
    this.renderBoss(state.boss, isMlh);
    this.renderParticles(state.particles);
  }

  private renderPlayer(p: PlayerState, isMlh: boolean): void {
    const ctx = this.ctx;
    if (p.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) return;

    const { x, y } = p.position;
    const { x: w, y: h } = p.size;

    if (isMlh) {
      // 🖥️ MLH MODE PLAYER: Pixel Desktop Computer!
      if (p.shieldActive) {
        ctx.strokeStyle = '#ffc72c'; ctx.lineWidth = 3;
        ctx.strokeRect(x - 6, y - 6, w + 12, h + 12);
      }

      // Computer Monitor Frame (Off-white / grey)
      ctx.fillStyle = '#f7f4ed';
      ctx.fillRect(x + 2, y, w - 4, h * 0.65);
      ctx.strokeStyle = '#111118'; ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, y, w - 4, h * 0.65);

      // Screen (Dark Navy)
      ctx.fillStyle = '#111118';
      ctx.fillRect(x + 6, y + 4, w - 12, h * 0.45);

      // Screen Face Expression (Bright Yellow / Cyan)
      ctx.fillStyle = '#ffc72c';
      ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
      const face = p.invulnerable ? '>_<' : p.shieldActive ? '^v^' : '•_•';
      ctx.fillText(face, x + w / 2, y + 15);

      // Computer Stand / Base
      ctx.fillStyle = '#e0d8cc';
      ctx.fillRect(x + w / 2 - 4, y + h * 0.65, 8, 4);

      // Keyboard
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y + h * 0.75, w, h * 0.25);
      ctx.strokeRect(x, y + h * 0.75, w, h * 0.25);

      // Keyboard Keys details
      ctx.fillStyle = '#111118';
      ctx.fillRect(x + 3, y + h * 0.8, w - 6, 2);

    } else {
      // CLASSIC MODE PLAYER: Retro Spaceship
      if (p.shieldActive) {
        ctx.strokeStyle = COLORS.playerShield; ctx.lineWidth = 2; ctx.shadowColor = COLORS.playerShield; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w * 0.75, h * 0.75, 0, 0, Math.PI * 2);
        ctx.stroke(); ctx.shadowBlur = 0;
      }

      ctx.fillStyle = COLORS.player; ctx.shadowColor = COLORS.player; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.closePath();
      ctx.fill(); ctx.shadowBlur = 0;

      ctx.fillStyle = '#ff8800';
      ctx.fillRect(x + w / 2 - 4, y + h, 8, 4 + Math.random() * 4);
    }
  }

  private renderEnemies(enemies: EnemyState[], isMlh: boolean): void {
    const ctx = this.ctx;
    const time = Date.now() * 0.005;

    for (const e of enemies) {
      if (!e.active) continue;
      const { x, y } = e.position;
      const { x: w, y: h } = e.size;
      const row = e.row % 4;

      if (isMlh) {
        // MLH MODE ENEMIES: Neo-Brutalist Software Bugs 🐞🐝🪲
        const cx = x + w / 2;
        const cy = y + h / 2;

        switch (row) {
          case 0: { // Basic Bug: Red Software Bug
            ctx.fillStyle = '#d92b2b';
            ctx.fillRect(x + 4, y + 4, w - 8, h - 6);
            ctx.strokeStyle = '#111118'; ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, y + 4, w - 8, h - 6);
            // Bug antenna & legs
            ctx.fillStyle = '#111118';
            ctx.fillRect(cx - 5, y + 1, 2, 4); ctx.fillRect(cx + 3, y + 1, 2, 4);
            ctx.fillRect(x, cy - 2, 4, 3); ctx.fillRect(x + w - 4, cy - 2, 4, 3);
            ctx.fillRect(x, cy + 4, 4, 3); ctx.fillRect(x + w - 4, cy + 4, 4, 3);
            // Spots
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx - 4, cy - 1, 3, 3); ctx.fillRect(cx + 2, cy - 1, 3, 3);
            break;
          }
          case 1: { // Fast Bug: Blue Motion Bug
            ctx.fillStyle = '#ffc72c';
            ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
            ctx.strokeStyle = '#111118'; ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
            // Motion wings
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - 3, y + 4, 5, 6); ctx.fillRect(x + w - 2, y + 4, 5, 6);
            // Bug Eyes
            ctx.fillStyle = '#111118';
            ctx.fillRect(cx - 5, y + 5, 3, 3); ctx.fillRect(cx + 2, y + 5, 3, 3);
            break;
          }
          case 2: { // Armored Bug: Yellow Beetle
            ctx.fillStyle = '#f5a623';
            ctx.fillRect(x + 3, y + 3, w - 6, h - 4);
            ctx.strokeStyle = '#111118'; ctx.lineWidth = 2.5;
            ctx.strokeRect(x + 3, y + 3, w - 6, h - 4);
            // Shell carapace armor line
            ctx.fillRect(cx - 1, y + 3, 2, h - 4);
            // Horns
            ctx.fillStyle = '#111118';
            ctx.fillRect(cx - 6, y - 2, 3, 5); ctx.fillRect(cx + 3, y - 2, 3, 5);
            break;
          }
          default: { // Dark Bug
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
            ctx.strokeStyle = '#111118'; ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
            ctx.fillStyle = '#d92b2b';
            ctx.fillRect(cx - 4, cy - 2, 8, 4);
            break;
          }
        }

      } else {
        // CLASSIC MODE ENEMIES: Retro Pixel Invaders
        const color = COLORS.enemyRow[e.row % COLORS.enemyRow.length];
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 6;

        ctx.fillRect(x + w * 0.2, y, w * 0.6, h * 0.3); ctx.fillRect(x, y + h * 0.3, w, h * 0.4);
        ctx.fillRect(x + w * 0.1, y + h * 0.7, w * 0.25, h * 0.3); ctx.fillRect(x + w * 0.65, y + h * 0.7, w * 0.25, h * 0.3);

        ctx.fillStyle = COLORS.background;
        ctx.fillRect(x + w * 0.25, y + h * 0.35, w * 0.15, h * 0.15); ctx.fillRect(x + w * 0.6, y + h * 0.35, w * 0.15, h * 0.15);
        ctx.shadowBlur = 0;
      }

      if (e.type === 'armored' && e.health < e.maxHealth) {
        ctx.fillStyle = isMlh ? '#d92b2b' : COLORS.projectileEnemy;
        ctx.fillRect(x, y - 4, w * (e.health / e.maxHealth), 3);
      }
    }
  }

  private renderProjectiles(projectiles: ProjectileState[], isMlh: boolean): void {
    const ctx = this.ctx;
    for (const p of projectiles) {
      if (!p.active) continue;
      if (isMlh) {
        ctx.fillStyle = p.owner === 'player' ? '#ffffff' : '#ffc72c';
        ctx.fillRect(p.position.x, p.position.y, p.size.x, p.size.y);
        ctx.strokeStyle = '#111118'; ctx.lineWidth = 1;
        ctx.strokeRect(p.position.x, p.position.y, p.size.x, p.size.y);
      } else {
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        ctx.fillRect(p.position.x, p.position.y, p.size.x, p.size.y); ctx.shadowBlur = 0;
      }
    }
  }

  private renderPowerUps(powerUps: PowerUpState[], isMlh: boolean): void {
    const ctx = this.ctx;
    for (const pu of powerUps) {
      if (!pu.active) continue;
      const cx = pu.position.x + pu.size.x / 2; const cy = pu.position.y + pu.size.y / 2;
      const r = pu.size.x / 2;

      if (isMlh) {
        ctx.fillStyle = pu.type === 'tripleShot' ? '#ffc72c' : pu.type === 'shield' ? '#1b40b8' : '#0f8a44';
        ctx.fillRect(pu.position.x, pu.position.y, pu.size.x, pu.size.y);
        ctx.strokeStyle = '#111118'; ctx.lineWidth = 2;
        ctx.strokeRect(pu.position.x, pu.position.y, pu.size.x, pu.size.y);

        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        const label = pu.type === 'tripleShot' ? '3x' : pu.type === 'shield' ? 'SH' : 'SP';
        ctx.fillText(label, cx, cy + 3);

      } else {
        ctx.fillStyle = pu.color; ctx.shadowColor = pu.color; ctx.shadowBlur = 10;
        const angle = Date.now() * 0.003;

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
  }

  // Boss: Queen Hornet / Mega Glitch Bug 🦗
  private renderBoss(boss: BossState | null, isMlh: boolean): void {
    const ctx = this.ctx;
    if (!boss || !boss.active) return;
    const { x, y } = boss.position;
    const { x: w, y: h } = boss.size;
    const cx = x + w / 2;
    const cy = y + h / 2;

    if (isMlh) {
      // MLH MODE BOSS: Mega Glitch Bug 🦗
      ctx.fillStyle = '#d92b2b';
      ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
      ctx.strokeStyle = '#111118'; ctx.lineWidth = 3;
      ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);

      // Horns
      ctx.fillStyle = '#ffc72c';
      ctx.fillRect(cx - 15, y - 6, 8, 10); ctx.fillRect(cx + 7, y - 6, 8, 10);
      ctx.strokeRect(cx - 15, y - 6, 8, 10); ctx.strokeRect(cx + 7, y - 6, 8, 10);

      // Eyes
      ctx.fillStyle = '#111118';
      ctx.fillRect(cx - 20, cy - 8, 10, 10); ctx.fillRect(cx + 10, cy - 8, 10, 10);

      // Health Bar
      const barWidth = w; const barHeight = 8; const barY = y - 16;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x, barY, barWidth, barHeight);
      ctx.strokeRect(x, barY, barWidth, barHeight);
      ctx.fillStyle = '#d92b2b'; ctx.fillRect(x, barY, barWidth * (boss.health / boss.maxHealth), barHeight);

    } else {
      // CLASSIC MODE BOSS: Queen Hornet
      const time = Date.now() * 0.008;
      const wingFlap = Math.sin(time * 3) * 6;

      ctx.fillStyle = 'rgba(255, 0, 255, 0.4)';
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(cx - 30, cy - 10, 35, 12 + wingFlap, -0.3, 0, Math.PI * 2);
      ctx.ellipse(cx + 30, cy - 10, 35, 12 - wingFlap, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = COLORS.boss;
      ctx.shadowColor = COLORS.boss;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.4, h * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffaa00';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(cx - 15, y + 10); ctx.lineTo(cx - 25, y - 8); ctx.lineTo(cx - 10, y + 2);
      ctx.moveTo(cx + 15, y + 10); ctx.lineTo(cx + 25, y - 8); ctx.lineTo(cx + 10, y + 2);
      ctx.moveTo(cx - 5, y + 5); ctx.lineTo(cx, y - 10); ctx.lineTo(cx + 5, y + 5);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ff0000';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx - 16, cy - 8, 8, 0, Math.PI * 2);
      ctx.arc(cx + 16, cy - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#111';
      ctx.fillRect(cx - 20, cy + 5, 40, 4);
      ctx.fillRect(cx - 15, cy + 13, 30, 4);

      const barWidth = w; const barHeight = 6; const barY = y - 16;
      ctx.fillStyle = '#333'; ctx.fillRect(x, barY, barWidth, barHeight);
      ctx.fillStyle = COLORS.boss; ctx.fillRect(x, barY, barWidth * (boss.health / boss.maxHealth), barHeight);
    }
  }

  private renderParticles(particles: { x: number; y: number; life: number; color: string }[]): void {
    const ctx = this.ctx;
    for (const p of particles) {
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;
  }
}
