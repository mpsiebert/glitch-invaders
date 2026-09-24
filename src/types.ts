// ============================================================
// Glitch Invaders — Shared Type Definitions
// ============================================================

// ─── Geometry ────────────────────────────────────────────────

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Game Entities ───────────────────────────────────────────

export type EnemyType = 'basic' | 'fast' | 'armored';
export type PowerUpType = 'tripleShot' | 'shield' | 'speedBoost';

export interface EntityState {
  position: Vector2D;
  size: Vector2D;
  velocity: Vector2D;
  active: boolean;
}

export interface PlayerState {
  position: Vector2D;
  size: Vector2D;
  health: number;
  maxHealth: number;
  shieldActive: boolean;
  currentWeapon: string;
  invulnerable: boolean;
  invulnerableUntil: number;
  speed: number;
}

export interface EnemyState extends EntityState {
  type: EnemyType;
  health: number;
  maxHealth: number;
  points: number;
  row: number;
  col: number;
  /** If set, this enemy drops a specific power-up when killed */
  dropType?: PowerUpType;
}

export interface BossState extends EntityState {
  health: number;
  maxHealth: number;
  phase: 'spawning' | 'active' | 'defeated';
  lastFireTime: number;
  fireInterval: number;
  points: number;
}

export interface ProjectileState extends EntityState {
  damage: number;
  owner: 'player' | 'enemy';
  color: string;
}

export interface PowerUpState extends EntityState {
  type: PowerUpType;
  color: string;
}

export interface ShieldBarrierState {
  position: Vector2D;
  blocks: boolean[][]; // Grid of intact blocks
  blockSize: number;
}

// ─── Weapons ─────────────────────────────────────────────────

export interface WeaponConfig {
  projectileCount: number;
  spread: number;       // Degrees between projectiles
  fireRate: number;     // ms between shots
  damage: number;
  color: string;
}

export class WeaponConfigError extends Error {
  constructor(public weaponType: string) {
    super(`Configuration missing for weapon: ${weaponType}`);
    this.name = 'WeaponConfigError';
  }
}

// ─── Bounties ────────────────────────────────────────────────

export type BountyId = 'triple-trouble' | 'friendly-fire' | 'boss-buffering';

export type BountyPhase =
  | 'locked'
  | 'active'
  | 'encountered'
  | 'investigating'
  | 'evidence'
  | 'repair-select'
  | 'verifying'
  | 'completed';

export interface BountyState {
  id: BountyId;
  phase: BountyPhase;
  eventId: string | null;
  traceId: string | null;
  hintsUsed: number;
  repairAttempts: number;
  selectedRepair: number | null;
  isOptional: boolean;
}

export interface RepairOption {
  id: number;
  title: string;
  description: string;
  codeSnippet: string;
  isCorrect: boolean;
}

export interface BountyDefinition {
  id: BountyId;
  title: string;
  tagline: string;
  discoveryMessage: string;
  evidenceQuestion: string;
  acceptedAnswers: string[];
  wrongAnswerHint: string;
  repairs: RepairOption[];
  hints: [string, string, string];
  isOptional: boolean;
}

// ─── Game State ──────────────────────────────────────────────

export type ScreenType = 'welcome' | 'game' | 'completion' | 'gameover';

export type GameEnginePhase =
  | 'playing'
  | 'paused'
  | 'boss-intro'
  | 'game-over'
  | 'bug-encountered'
  | 'replaying';

export interface GameCallbacks {
  onBugEncountered: (bountyId: BountyId, eventId: string | null) => void;
  onBugEncounteredWithTrace: (bountyId: BountyId, traceId: string | null) => void;
  onScoreChange: (delta: number) => void;
  onLivesChange: (lives: number) => void;
  onGameOver: () => void;
  onBossDefeated: () => void;
  onAllEnemiesCleared: () => void;
}

// ─── Leaderboard ─────────────────────────────────────────────

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  date: string;
  bountiesFixed: number;
}

// ─── Sentry Config ───────────────────────────────────────────

export interface SentryConfig {
  dsn: string;
  org: string;
  project: string;
  environment: string;
  stationId: string;
}

// ─── Scoring ─────────────────────────────────────────────────

export interface ScoreBreakdown {
  bugDiscoveries: number;
  evidenceSubmissions: number;
  repairs: number;
  verifications: number;
  bonuses: number;
  total: number;
}

// ─── Sound ───────────────────────────────────────────────────

export type SoundType =
  | 'shoot'
  | 'hit'
  | 'explosion'
  | 'powerUp'
  | 'shieldUp'
  | 'bossAlert'
  | 'success'
  | 'fail'
  | 'menuSelect'
  | 'bugFound';
