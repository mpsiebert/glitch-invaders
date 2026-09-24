// Game canvas and layout
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 30;
export const PLAYER_SPEED = 5;
export const PLAYER_MAX_HEALTH = 3;
export const PLAYER_INVULN_MS = 2000;

// Enemies
export const ENEMY_ROWS = 4;
export const ENEMY_COLS = 8;
export const ENEMY_WIDTH = 32;
export const ENEMY_HEIGHT = 24;
export const ENEMY_PADDING = 12;
export const ENEMY_TOP_OFFSET = 60;
export const ENEMY_MOVE_SPEED = 1.5;
export const ENEMY_DROP_DISTANCE = 20;
export const ENEMY_FIRE_INTERVAL = 2000;
export const ENEMY_POINTS: Record<string, number> = { basic: 10, fast: 20, armored: 30 };

// Boss
export const BOSS_WIDTH = 80;
export const BOSS_HEIGHT = 50;
export const BOSS_HEALTH = 20;
export const BOSS_SPEED = 2;
export const BOSS_FIRE_INTERVAL = 800;
export const BOSS_POINTS = 500;

// Projectiles
export const PROJECTILE_SPEED = 7;
export const ENEMY_PROJECTILE_SPEED = 3;
export const PROJECTILE_WIDTH = 4;
export const PROJECTILE_HEIGHT = 12;

// Power-ups
export const POWERUP_SIZE = 20;
export const POWERUP_SPEED = 2;

// Shield barriers
export const SHIELD_BARRIER_COUNT = 3;
export const SHIELD_BARRIER_WIDTH = 60;
export const SHIELD_BARRIER_HEIGHT = 40;
export const SHIELD_BLOCK_SIZE = 4;

// Bug encounter triggers
export const BUG1_TRIGGER_KILLS = 6;
export const BUG1_ENEMY_ROW = 1;
export const BUG1_ENEMY_COL = 3;
export const BUG2_ENEMY_ROW = 2;
export const BUG2_ENEMY_COL = 5;

// Scoring
export const SCORE_BUG_DISCOVERED = 100;
export const SCORE_EVIDENCE_NO_HINTS = 300;
export const SCORE_EVIDENCE_1_HINT = 200;
export const SCORE_EVIDENCE_2_HINTS = 100;
export const SCORE_EVIDENCE_3_HINTS = 50;
export const SCORE_REPAIR_FIRST_TRY = 200;
export const SCORE_REPAIR_SECOND_TRY = 100;
export const SCORE_VERIFICATION = 150;
export const SCORE_BOSS_BONUS = 500;

// Colors
export const COLORS = {
  background: '#0a0a1a',
  player: '#00ffff',
  playerShield: '#4488ff',
  enemyRow: ['#00ff88', '#88ff00', '#ffaa00', '#ff4444', '#ff44ff'],
  projectilePlayer: '#00ffff',
  projectileEnemy: '#ff4444',
  powerUpTriple: '#ffaa00',
  powerUpShield: '#4488ff',
  powerUpSpeed: '#00ff88',
  shieldBarrier: '#00ff44',
  boss: '#ff00ff',
  neonCyan: '#00ffff',
  neonMagenta: '#ff00ff',
  neonGreen: '#00ff88',
  neonAmber: '#ffaa00',
  textPrimary: '#e0e0e0',
  textDim: '#888888',
  panelBg: 'rgba(10, 10, 26, 0.95)',
  panelBorder: '#00ffff',
} as const;

export const GAME_VERSION = '1.0.0';
