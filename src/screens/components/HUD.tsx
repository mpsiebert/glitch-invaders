import React from 'react';
import type { BountyId, BountyState } from '../../types';
import { useTheme } from '../../theme/ThemeContext';

interface HUDProps {
  score: number;
  lives: number;
  bounties: Record<BountyId, BountyState>;
  activeBounty: BountyId | null;
}

export function HUD({ score, lives, bounties, activeBounty }: HUDProps) {
  const { theme } = useTheme();
  const isMlh = theme === 'mlh';
  const bountyOrder: BountyId[] = ['triple-trouble', 'friendly-fire', 'boss-buffering'];
  const completedCount = Object.values(bounties).filter(b => b.phase === 'completed').length;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', width: '100%', maxWidth: 820 }}>
      {/* Score Block */}
      <div
        className={isMlh ? 'panel' : ''}
        style={
          isMlh
            ? { padding: '6px 12px', background: '#111118', color: '#ffffff', border: '2px solid #111118', borderRadius: 4, boxShadow: '2px 2px 0px #d92b2b' }
            : {}
        }
      >
        <span style={{ fontSize: 10, color: isMlh ? '#ffc72c' : 'var(--color-text-dim)', marginRight: 6 }}>SCORE</span>
        <span className="pixel-text neon-text-amber" style={{ fontSize: 13 }} role="status" aria-live="polite">
          {score.toLocaleString()}
        </span>
      </div>

      {/* Bounty Tracker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isMlh && (
          <span className="pixel-text" style={{ fontSize: 10, fontWeight: 'bold', color: '#111118' }}>
            BUGS {completedCount}/3
          </span>
        )}
        <div className="bounty-tracker">
          {bountyOrder.map(id => {
            const b = bounties[id];
            let className = 'bounty-dot';
            let statusText = 'locked';
            if (b.phase === 'completed') { className += ' completed'; statusText = 'completed'; }
            else if (id === activeBounty && b.phase !== 'locked') { className += ' active'; statusText = 'active'; }
            else { className += ' locked'; }

            const labelMap: Record<BountyId, string> = {
              'triple-trouble': 'Triple Trouble',
              'friendly-fire': 'Friendly Fire',
              'boss-buffering': 'Boss Buffering'
            };

            return <div key={id} className={className} title={id} aria-label={`${labelMap[id]}: ${statusText}`} />;
          })}
        </div>
      </div>

      {/* Lives display */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} style={{ fontSize: isMlh ? 16 : 14, opacity: i < lives ? 1 : 0.2 }}>
            {isMlh ? '🖥️' : '🚀'}
          </span>
        ))}
      </div>
    </div>
  );
}
