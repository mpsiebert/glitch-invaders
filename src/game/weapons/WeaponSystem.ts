import type { ProjectileState, WeaponConfig } from '../../types';
import { WeaponConfigError } from '../../types';
import { WEAPON_CONFIGS } from './weapons.config';
import { PROJECTILE_SPEED, PROJECTILE_WIDTH, PROJECTILE_HEIGHT } from '../../config/constants';
import { addGameBreadcrumb } from '../../sentry/telemetry';

export class WeaponSystem {
  private lastFireTime = 0;

  fire(weaponType: string, shipX: number, shipY: number, shipWidth: number): ProjectileState[] {
    addGameBreadcrumb('game.weapon', `Firing weapon: ${weaponType}`, { weaponType });

    const config = WEAPON_CONFIGS[weaponType];
    if (!config) throw new WeaponConfigError(weaponType);

    const now = Date.now();
    if (now - this.lastFireTime < config.fireRate) return [];
    this.lastFireTime = now;

    return this.createProjectiles(config, shipX, shipY, shipWidth);
  }

  private createProjectiles(config: WeaponConfig, shipX: number, shipY: number, shipWidth: number): ProjectileState[] {
    const projectiles: ProjectileState[] = [];
    const centerX = shipX + shipWidth / 2 - PROJECTILE_WIDTH / 2;
    const count = config.projectileCount;
    const spreadRad = (config.spread * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      let angle = 0;
      if (count > 1) angle = -spreadRad / 2 + (spreadRad / (count - 1)) * i;

      projectiles.push({
        position: { x: centerX, y: shipY - PROJECTILE_HEIGHT },
        size: { x: PROJECTILE_WIDTH, y: PROJECTILE_HEIGHT },
        velocity: { x: Math.sin(angle) * PROJECTILE_SPEED, y: -PROJECTILE_SPEED * Math.cos(angle) },
        active: true,
        damage: config.damage,
        owner: 'player',
        color: config.color,
      });
    }
    return projectiles;
  }

  resetCooldown(): void { this.lastFireTime = 0; }
}
