import type { Vector2D } from '../../types';

export interface Collidable {
  position: Vector2D;
  size: Vector2D;
  active: boolean;
}

export function checkCollision(a: Collidable, b: Collidable): boolean {
  if (!a.active || !b.active) return false;
  return (
    a.position.x < b.position.x + b.size.x &&
    a.position.x + a.size.x > b.position.x &&
    a.position.y < b.position.y + b.size.y &&
    a.position.y + a.size.y > b.position.y
  );
}
