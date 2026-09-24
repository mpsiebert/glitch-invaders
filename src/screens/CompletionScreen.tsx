import React, { useMemo } from 'react';
import { useGameState } from '../state/GameStateContext';

export function CompletionScreen() {
  const { score, bounties, startTime, resetRun, isDemoMode } = useGameState();

  const elapsed = useMemo(() => {
    const ms = Date.now() - startTime;
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [startTime]);

  const completedCount = Object.values(bounties).filter(b => b.phase === 'completed').length;

  return (
    <div className="arcade-cabinet" style={{ justifyContent: 'center', gap: 24, padding: 40 }}>
      <h1 className="pixel-text neon-text-green" style={{ fontSize: 24, textAlign: 'center' }}>
        Mission Complete!
      </h1>

      <div className="panel panel-green" style={{ maxWidth: 500, textAlign: 'center' }}>
        <div className="pixel-text neon-text-amber" style={{ fontSize: 20, marginBottom: 12 }}>
          {score.toLocaleString()} pts
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>
          Time: {elapsed} · Bugs Fixed: {completedCount}/3
        </div>
      </div>

      <div style={{ maxWidth: 500, width: '100%' }}>
        {(Object.values(bounties) as Array<{ id: string; phase: string; hintsUsed: number; repairAttempts: number }>).map(b => (
          <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #333' }}>
            <span style={{ textTransform: 'capitalize' }}>
              {b.phase === 'completed' ? '✅' : '⬜'} {b.id.replace(/-/g, ' ')}
            </span>
            {b.phase === 'completed' && (
              <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>
                {b.hintsUsed} hints · {b.repairAttempts} attempts
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="panel" style={{ maxWidth: 500 }}>
        <h3 className="pixel-text neon-text-cyan" style={{ fontSize: 12, marginBottom: 16 }}>What you learned</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
          <div>🔍 <strong>Stack traces</strong> locate failures — they show exactly where an error occurred in the code.</div>
          <div>🍞 <strong>Breadcrumbs</strong> explain what happened before — a timeline of events leading up to the error.</div>
          <div>⏱️ <strong>Traces</strong> reveal where time is spent — showing each operation and its duration.</div>
        </div>
      </div>

      {isDemoMode && <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-amber)' }}>Demo mode — connect Sentry for the full experience</div>}

      <button className="btn btn-primary btn-large" onClick={resetRun} style={{ alignSelf: 'center' }}>
        Next Player
      </button>
    </div>
  );
}
