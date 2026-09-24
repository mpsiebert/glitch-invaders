import React from 'react';
import type { BountyId, BountyState } from '../../types';

interface HUDProps {
  score: number;
  lives: number;
  bounties: Record<BountyId, BountyState>;
  activeBounty: BountyId | null;
}

export function HUD({ score, lives, bounties, activeBounty }: HUDProps) {
  const bountyOrder: BountyId[] = ['triple-trouble', 'friendly-fire', 'boss-buffering'];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', width: '100%', maxWidth: 820 }}>
      <div className="pixel-text neon-text-amber" style={{ fontSize: 12 }}>
        {score.toLocaleString()}
      </div>

      <div className="bounty-tracker">
        {bountyOrder.map(id => {
          const b = bounties[id];
          let className = 'bounty-dot';
          if (b.phase === 'completed') className += ' completed';
          else if (id === activeBounty && b.phase !== 'locked') className += ' active';
          else className += ' locked';
          return <div key={id} className={className} title={id} />;
        })}
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} style={{ fontSize: 14, opacity: i < lives ? 1 : 0.2 }}>🚀</span>
        ))}
      </div>
    </div>
  );
}
