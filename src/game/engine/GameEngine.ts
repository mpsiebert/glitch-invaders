import type {
  PlayerState, EnemyState, ProjectileState, PowerUpState,
  BossState, GameCallbacks, GameEnginePhase, BountyId, PowerUpType,
} from '../../types';
import { WeaponConfigError } from '../../types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, PLAYER_MAX_HEALTH, PLAYER_INVULN_MS,
  ENEMY_ROWS, ENEMY_COLS, ENEMY_WIDTH, ENEMY_HEIGHT, ENEMY_PADDING,
  ENEMY_TOP_OFFSET, ENEMY_MOVE_SPEED, ENEMY_DROP_DISTANCE, ENEMY_FIRE_INTERVAL,
  ENEMY_PROJECTILE_SPEED,
  PROJECTILE_SPEED, PROJECTILE_WIDTH, PROJECTILE_HEIGHT,
  POWERUP_SIZE, POWERUP_SPEED,
  BOSS_WIDTH, BOSS_HEIGHT, BOSS_HEALTH, BOSS_SPEED, BOSS_FIRE_INTERVAL, BOSS_POINTS,
  BUG1_ENEMY_ROW, BUG1_ENEMY_COL, BUG2_ENEMY_ROW, BUG2_ENEMY_COL,
  COLORS, ENEMY_POINTS,
} from '../../config/constants';
import { InputManager } from './InputManager';
import { SoundManager } from './SoundManager';
import { checkCollision } from './CollisionSystem';
import { WeaponSystem } from '../weapons/WeaponSystem';
import { addGameBreadcrumb } from '../../sentry/telemetry';
import { calculateShieldDamage, handleFriendlyFireBug } from '../bugs/friendlyFire';
import { handleTripleTroubleError } from '../bugs/tripleTrouble';
import { spawnBossWithTracing } from '../bugs/bossBuffering';
import { GameRenderer } from './GameRenderer';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;
  readonly sound: SoundManager;
  private weapon: WeaponSystem;
  private callbacks: GameCallbacks;
  private runId: string;
  private renderer: GameRenderer;

  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  phase: GameEnginePhase = 'playing';
  private player: PlayerState;
  private enemies: EnemyState[] = [];
  private projectiles: ProjectileState[] = [];
  private powerUps: PowerUpState[] = [];
  private boss: BossState | null = null;
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = [];

  private killCount = 0;
  private enemyDirection = 1;
  private lastEnemyFire = 0;

  private shakeIntensity = 0;
  private shakeDuration = 0;

  private bug1Triggered = false;
  private bug2Triggered = false;
  private bug3Triggered = false;
  private awaitingBug2Hit = false;
  private bug2ShieldCollected = false;

  private verifyingBounty: BountyId | null = null;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks, runId: string) {
    this.canvas = canvas;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputManager();
    this.sound = new SoundManager();
    this.weapon = new WeaponSystem();
    this.callbacks = callbacks;
    this.runId = runId;
    this.renderer = new GameRenderer(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.player = this.createPlayer();
    this.spawnEnemyWave();
  }

  private createPlayer(): PlayerState {
    return {
      position: { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - PLAYER_HEIGHT - 80 },
      size: { x: PLAYER_WIDTH, y: PLAYER_HEIGHT },
      health: PLAYER_MAX_HEALTH, maxHealth: PLAYER_MAX_HEALTH,
      shieldActive: false, currentWeapon: 'single',
      invulnerable: false, invulnerableUntil: 0, speed: PLAYER_SPEED,
    };
  }

  spawnEnemyWave(): void {
    this.enemies = [];
    const types: import('../../types').EnemyType[] = ['basic', 'fast', 'armored', 'basic'];
    const startX = (CANVAS_WIDTH - (ENEMY_COLS * (ENEMY_WIDTH + ENEMY_PADDING))) / 2;

    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        const type = types[row % types.length];
        const enemy: EnemyState = {
          position: { x: startX + col * (ENEMY_WIDTH + ENEMY_PADDING), y: ENEMY_TOP_OFFSET + row * (ENEMY_HEIGHT + ENEMY_PADDING) },
          size: { x: ENEMY_WIDTH, y: ENEMY_HEIGHT },
          velocity: { x: ENEMY_MOVE_SPEED, y: 0 },
          active: true, type, health: type === 'armored' ? 2 : 1, maxHealth: type === 'armored' ? 2 : 1,
          points: ENEMY_POINTS[type] || 10, row, col,
        };

        if (row === BUG1_ENEMY_ROW && col === BUG1_ENEMY_COL) enemy.dropType = 'tripleShot';
        if (row === BUG2_ENEMY_ROW && col === BUG2_ENEMY_COL) enemy.dropType = 'shield';

        this.enemies.push(enemy);
      }
    }
    this.enemyDirection = 1;
    this.killCount = 0;
  }

  start(): void {
    if (this.animFrameId !== null) return;
    this.lastTimestamp = performance.now();
    this.phase = 'playing';
    const loop = (timestamp: number) => {
      const dt = Math.min(timestamp - this.lastTimestamp, 33.33);
      this.lastTimestamp = timestamp;
      if (this.phase === 'playing' || this.phase === 'replaying') this.update(dt);
      this.render(dt);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.animFrameId !== null) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null; }
  }

  pause(): void { this.phase = 'bug-encountered'; }
  resume(): void { this.phase = 'playing'; }

  private update(dt: number): void {
    const dtFactor = dt / 16.67;
    this.updatePlayer(dtFactor);
    this.updateProjectiles(dtFactor);
    this.updateEnemies(dtFactor);
    this.updatePowerUps(dtFactor);
    this.updateBoss(dtFactor);
    this.updateParticles(dtFactor);
    this.checkCollisions();
    this.checkBugTriggers();
  }

  private updatePlayer(dt: number): void {
    const p = this.player;
    if (p.invulnerable && Date.now() > p.invulnerableUntil) p.invulnerable = false;
    if (this.input.isDown('left')) p.position.x = Math.max(0, p.position.x - p.speed * dt);
    if (this.input.isDown('right')) p.position.x = Math.min(CANVAS_WIDTH - p.size.x, p.position.x + p.speed * dt);

    if (this.input.isDown('fire')) {
      try {
        const newProjectiles = this.weapon.fire(p.currentWeapon, p.position.x, p.position.y, p.size.x);
        if (newProjectiles.length > 0) {
          this.projectiles.push(...newProjectiles);
          this.sound.play('shoot');
        }
      } catch (error) {
        if (error instanceof WeaponConfigError) {
          this.sound.play('bugFound');
          this.player.currentWeapon = 'single';
          const eventId = handleTripleTroubleError(error, this.runId);
          this.pause();
          this.callbacks.onBugEncountered('triple-trouble', eventId);
        } else throw error;
      }
    }
  }

  private updateProjectiles(dt: number): void {
    for (const p of this.projectiles) {
      if (!p.active) continue;
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      if (p.position.y < -20 || p.position.y > CANVAS_HEIGHT + 20 || p.position.x < -20 || p.position.x > CANVAS_WIDTH + 20) {
        p.active = false;
      }
    }
    this.projectiles = this.projectiles.filter(p => p.active);
  }

  private updateEnemies(dt: number): void {
    if (this.enemies.length === 0) return;
    const activeEnemies = this.enemies.filter(e => e.active);
    if (activeEnemies.length === 0) return;

    let shouldDrop = false;
    for (const e of activeEnemies) {
      if ((e.position.x + e.size.x >= CANVAS_WIDTH - 10 && this.enemyDirection > 0) ||
          (e.position.x <= 10 && this.enemyDirection < 0)) {
        shouldDrop = true; break;
      }
    }

    if (shouldDrop) {
      this.enemyDirection *= -1;
      for (const e of activeEnemies) e.position.y += ENEMY_DROP_DISTANCE;
    }

    for (const e of activeEnemies) {
      e.position.x += ENEMY_MOVE_SPEED * this.enemyDirection * dt;
      if (e.position.y > CANVAS_HEIGHT) e.active = false;
    }

    const now = Date.now();
    if (now - this.lastEnemyFire > ENEMY_FIRE_INTERVAL && activeEnemies.length > 0) {
      this.lastEnemyFire = now;
      const shooter = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
      this.projectiles.push({
        position: { x: shooter.position.x + shooter.size.x / 2 - PROJECTILE_WIDTH / 2, y: shooter.position.y + shooter.size.y },
        size: { x: PROJECTILE_WIDTH, y: PROJECTILE_HEIGHT },
        velocity: { x: 0, y: ENEMY_PROJECTILE_SPEED }, active: true, damage: 1, owner: 'enemy', color: COLORS.projectileEnemy,
      });
    }
  }

  private updatePowerUps(dt: number): void {
    for (const pu of this.powerUps) {
      if (!pu.active) continue;
      pu.position.y += POWERUP_SPEED * dt;
      if (pu.position.y > CANVAS_HEIGHT) pu.active = false;
    }
    this.powerUps = this.powerUps.filter(p => p.active);
  }

  private updateBoss(dt: number): void {
    if (!this.boss || !this.boss.active || this.boss.phase !== 'active') return;
    this.boss.position.x += this.boss.velocity.x * dt;
    if (this.boss.position.x <= 0 || this.boss.position.x + this.boss.size.x >= CANVAS_WIDTH) this.boss.velocity.x *= -1;

    const now = Date.now();
    if (now - this.boss.lastFireTime > this.boss.fireInterval) {
      this.boss.lastFireTime = now;
      for (let i = -1; i <= 1; i++) {
        this.projectiles.push({
          position: { x: this.boss.position.x + this.boss.size.x / 2 - PROJECTILE_WIDTH / 2, y: this.boss.position.y + this.boss.size.y },
          size: { x: PROJECTILE_WIDTH, y: PROJECTILE_HEIGHT }, velocity: { x: i * 1.5, y: ENEMY_PROJECTILE_SPEED },
          active: true, damage: 1, owner: 'enemy', color: COLORS.boss,
        });
      }
    }
  }

  private updateParticles(dt: number): void {
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 0.05;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  private spawnExplosion(x: number, y: number, color: string): void {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 1 + Math.random() * 3;
      this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color });
    }
  }

  private checkCollisions(): void {
    const p = this.player;

    for (const proj of this.projectiles) {
      if (!proj.active || proj.owner !== 'player') continue;
      for (const enemy of this.enemies) {
        if (!enemy.active) continue;
        if (checkCollision(proj, enemy)) {
          proj.active = false;
          enemy.health -= proj.damage;
          this.sound.play('hit');
          if (enemy.health <= 0) {
            enemy.active = false;
            this.killCount++;
            this.callbacks.onScoreChange(enemy.points);
            this.sound.play('explosion');
            this.spawnExplosion(enemy.position.x + enemy.size.x / 2, enemy.position.y + enemy.size.y / 2, COLORS.enemyRow[enemy.row % COLORS.enemyRow.length]);
            if (enemy.dropType) this.spawnPowerUp(enemy.position.x, enemy.position.y, enemy.dropType);
          }
          break;
        }
      }

      if (this.boss && this.boss.active && this.boss.phase === 'active') {
        if (checkCollision(proj, this.boss)) {
          proj.active = false;
          this.boss.health -= proj.damage;
          this.sound.play('hit');
          if (this.boss.health <= 0) {
            this.boss.phase = 'defeated';
            this.boss.active = false;
            this.callbacks.onScoreChange(this.boss.points);
            this.sound.play('explosion');
            this.spawnExplosion(this.boss.position.x + this.boss.size.x / 2, this.boss.position.y + this.boss.size.y / 2, COLORS.boss);
            this.callbacks.onBossDefeated();
          }
        }
      }
    }

    if (!p.invulnerable) {
      for (const proj of this.projectiles) {
        if (!proj.active || proj.owner !== 'enemy') continue;
        const playerCollider = { position: p.position, size: p.size, active: true };
        if (checkCollision(proj, playerCollider)) {
          proj.active = false;
          this.handlePlayerHit(proj.damage);
          break;
        }
      }

      // Check for direct body collision with enemies
      if (!p.invulnerable) {
        const playerCollider = { position: p.position, size: p.size, active: true };
        for (const enemy of this.enemies) {
          if (!enemy.active) continue;
          if (checkCollision(enemy, playerCollider)) {
            enemy.active = false;
            this.handlePlayerHit(1);
            break;
          }
        }
      }
    }

    for (const pu of this.powerUps) {
      if (!pu.active) continue;
      const playerCollider = { position: p.position, size: p.size, active: true };
      if (checkCollision(pu, playerCollider)) {
        pu.active = false;
        this.collectPowerUp(pu.type);
      }
    }
  }

  private handlePlayerHit(damage: number): void {
    const p = this.player;
    const healthBefore = p.health;
    const { actualDamage, shieldConsumed } = calculateShieldDamage(p.shieldActive, damage);

    this.shakeIntensity = 4;
    this.shakeDuration = 200;

    if (shieldConsumed) p.shieldActive = false;
    p.health -= actualDamage;
    this.callbacks.onLivesChange(p.health);

    if (p.health <= 0) {
      if (shieldConsumed && !this.bug2Triggered && this.bug2ShieldCollected) {
        this.bug2Triggered = true;
        this.sound.play('bugFound');
        const eventId = handleFriendlyFireBug(this.runId, { shieldActive: true, incomingDamage: damage, actualDamage, healthBefore, healthAfter: p.health });
        this.respawnPlayer();
        this.pause();
        this.callbacks.onBugEncountered('friendly-fire', eventId);
        return;
      }
      this.sound.play('explosion');
      this.spawnExplosion(p.position.x + p.size.x / 2, p.position.y + p.size.y / 2, COLORS.player);
      this.respawnPlayer();
    } else {
      this.sound.play('hit');
      p.invulnerable = true;
      p.invulnerableUntil = Date.now() + PLAYER_INVULN_MS;
    }
  }

  private respawnPlayer(): void {
    const p = this.player;
    p.position.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    p.health = PLAYER_MAX_HEALTH;
    p.invulnerable = true;
    p.invulnerableUntil = Date.now() + PLAYER_INVULN_MS;
    p.shieldActive = false;
    this.callbacks.onLivesChange(p.health);
  }

  private collectPowerUp(type: PowerUpType): void {
    addGameBreadcrumb('game.powerup', `Power-up collected: ${type}`, { type });
    this.sound.play('powerUp');

    switch (type) {
      case 'tripleShot':
        addGameBreadcrumb('game.weapon', 'Weapon selected: triple', { weaponType: 'triple' });
        this.player.currentWeapon = 'triple';
        break;
      case 'shield':
        addGameBreadcrumb('game.shield', 'Shield collected', { type: 'shield' });
        this.player.shieldActive = true;
        this.bug2ShieldCollected = true;
        this.sound.play('shieldUp');
        if (!this.bug2Triggered) {
          this.awaitingBug2Hit = true;
          setTimeout(() => { if (this.awaitingBug2Hit && this.phase === 'playing') this.fireAtPlayer(); }, 800);
        }
        break;
      case 'speedBoost':
        this.player.speed = PLAYER_SPEED * 1.5;
        setTimeout(() => { this.player.speed = PLAYER_SPEED; }, 5000);
        break;
    }
  }

  private fireAtPlayer(): void {
    const p = this.player;
    this.projectiles.push({
      position: { x: p.position.x + p.size.x / 2, y: 60 },
      size: { x: PROJECTILE_WIDTH, y: PROJECTILE_HEIGHT },
      velocity: { x: 0, y: ENEMY_PROJECTILE_SPEED * 2 },
      active: true, damage: 1, owner: 'enemy', color: COLORS.projectileEnemy,
    });
  }

  private spawnPowerUp(x: number, y: number, type: PowerUpType): void {
    const colorMap: Record<PowerUpType, string> = { tripleShot: COLORS.powerUpTriple, shield: COLORS.powerUpShield, speedBoost: COLORS.powerUpSpeed || '#00ff88' };
    this.powerUps.push({
      position: { x, y }, size: { x: POWERUP_SIZE, y: POWERUP_SIZE }, velocity: { x: 0, y: POWERUP_SPEED },
      active: true, type, color: colorMap[type],
    });
  }

  private checkBugTriggers(): void {
    const activeEnemies = this.enemies.filter(e => e.active);
    if (activeEnemies.length === 0 && this.powerUps.length === 0 && !this.boss) {
      this.callbacks.onAllEnemiesCleared();
    }
  }

  async startBossWave(): Promise<void> {
    if (this.boss) return;
    this.phase = 'boss-intro';
    this.sound.play('bossAlert');

    const traceId = await spawnBossWithTracing(this.runId);

    if (!this.bug3Triggered) {
      this.bug3Triggered = true;
      this.pause();
      this.callbacks.onBugEncounteredWithTrace('boss-buffering', traceId);
      return;
    }

    this.activateBoss();
  }

  activateBoss(): void {
    this.boss = {
      position: { x: CANVAS_WIDTH / 2 - BOSS_WIDTH / 2, y: 40 },
      size: { x: BOSS_WIDTH, y: BOSS_HEIGHT },
      velocity: { x: BOSS_SPEED, y: 0 },
      active: true, health: BOSS_HEALTH, maxHealth: BOSS_HEALTH,
      phase: 'active', lastFireTime: Date.now(), fireInterval: BOSS_FIRE_INTERVAL, points: BOSS_POINTS,
    };
    this.phase = 'playing';
  }

  skipToNextBug(activeBounty: BountyId): void {
    switch (activeBounty) {
      case 'triple-trouble': {
        for (const e of this.enemies) if (!(e.row === BUG1_ENEMY_ROW && e.col === BUG1_ENEMY_COL)) e.active = false;
        const bugEnemy = this.enemies.find(e => e.row === BUG1_ENEMY_ROW && e.col === BUG1_ENEMY_COL && e.active);
        if (bugEnemy) { bugEnemy.active = false; this.killCount++; this.spawnPowerUp(bugEnemy.position.x, bugEnemy.position.y, 'tripleShot'); }
        break;
      }
      case 'friendly-fire': {
        for (const e of this.enemies) if (!(e.row === BUG2_ENEMY_ROW && e.col === BUG2_ENEMY_COL)) e.active = false;
        const shieldEnemy = this.enemies.find(e => e.row === BUG2_ENEMY_ROW && e.col === BUG2_ENEMY_COL && e.active);
        if (shieldEnemy) { shieldEnemy.active = false; this.spawnPowerUp(shieldEnemy.position.x, shieldEnemy.position.y, 'shield'); }
        break;
      }
      case 'boss-buffering': {
        for (const e of this.enemies) e.active = false;
        this.powerUps = [];
        break;
      }
    }
  }

  replayBugEncounter(bountyId: BountyId): void {
    this.phase = 'replaying';
    this.verifyingBounty = bountyId;
    this.projectiles = [];
    this.powerUps = [];

    switch (bountyId) {
      case 'triple-trouble': {
        this.player.currentWeapon = 'single';
        this.spawnPowerUp(this.player.position.x, this.player.position.y - 150, 'tripleShot');
        this.enemies = Array.from({ length: 3 }).map((_, i) => ({
          position: { x: 200 + i * 150, y: 100 }, size: { x: ENEMY_WIDTH, y: ENEMY_HEIGHT }, velocity: { x: 0, y: 0 },
          active: true, type: 'basic', health: 1, maxHealth: 1, points: 10, row: 0, col: i,
        }));
        break;
      }
      case 'friendly-fire': {
        this.player.shieldActive = false;
        this.bug2ShieldCollected = false;
        this.awaitingBug2Hit = false;
        this.spawnPowerUp(this.player.position.x, this.player.position.y - 150, 'shield');
        break;
      }
      case 'boss-buffering': {
        this.boss = null;
        this.startBossWave();
        break;
      }
    }
  }

  checkVerification(): { bountyId: BountyId; success: boolean } | null {
    if (!this.verifyingBounty) return null;
    const bountyId = this.verifyingBounty;

    switch (bountyId) {
      case 'triple-trouble':
        if (this.player.currentWeapon === 'triple') { this.verifyingBounty = null; return { bountyId, success: true }; }
        break;
      case 'friendly-fire':
        if (this.bug2ShieldCollected && !this.player.shieldActive && this.player.health > 0) { this.verifyingBounty = null; return { bountyId, success: true }; }
        break;
      case 'boss-buffering':
        if (this.boss && this.boss.phase === 'active') { this.verifyingBounty = null; return { bountyId, success: true }; }
        break;
    }
    return null;
  }

  getPlayerHealth(): number { return this.player.health; }
  getInputManager(): InputManager { return this.input; }

  private render(dt: number = 0): void {
    const ctx = this.ctx;
    
    ctx.save();
    if (this.shakeDuration > 0) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      ctx.translate(offsetX, offsetY);
      this.shakeDuration -= dt;
    }

    this.renderer.render({
      player: this.player,
      enemies: this.enemies,
      projectiles: this.projectiles,
      powerUps: this.powerUps,
      boss: this.boss,
      particles: this.particles
    });

    ctx.restore();
  }

  destroy(): void { this.stop(); this.input.destroy(); this.sound.destroy(); }

  reset(newRunId: string): void {
    this.stop(); this.runId = newRunId;
    this.player = this.createPlayer();
    this.enemies = []; this.projectiles = []; this.powerUps = []; this.boss = null; this.particles = [];
    this.killCount = 0;
    this.bug1Triggered = false; this.bug2Triggered = false; this.bug3Triggered = false;
    this.awaitingBug2Hit = false; this.bug2ShieldCollected = false; this.verifyingBounty = null;
    this.enemyDirection = 1; this.lastEnemyFire = 0;
    this.weapon.resetCooldown(); this.input.clearAll(); this.spawnEnemyWave();
  }
}
