import React, { useState } from 'react';
import { useGameState } from '../state/GameStateContext';
import { getLeaderboard } from '../state/LeaderboardManager';

export function WelcomeScreen() {
  const { setScreen, isDemoMode, stationId, runId } = useGameState();
  const [leaderboard] = useState(getLeaderboard);

  return (
    <div className="arcade-cabinet" style={{ justifyContent: 'center', gap: 24, padding: 32, overflowY: 'auto' }}>
      <h1 className="pixel-text neon-text-cyan animate-glitch-loop" style={{ fontSize: 28, textAlign: 'center', letterSpacing: 4 }}>
        Glitch Invaders
      </h1>

      <div style={{ textAlign: 'center' }}>
        {isDemoMode ? <span className="badge badge-demo">Demo Mode</span> : <span className="badge badge-live">Live Sentry</span>}
      </div>

      <div className="panel" style={{ maxWidth: 550, textAlign: 'center', width: '100%' }}>
        <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
          This cabinet shipped with <strong className="neon-text-amber">3 bugs</strong>.
          <br />Play to discover them. Use Sentry to investigate.
          <br />Apply repairs to restore the game.
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>
          ⌨️ Arrow keys or WASD to move · Space to fire
        </p>
      </div>

      {/* Leaderboard */}
      <div className="panel" style={{ maxWidth: 550, width: '100%' }}>
        <h3 className="pixel-text neon-text-amber" style={{ fontSize: 11, textAlign: 'center', marginBottom: 12, letterSpacing: 2 }}>
          🏆 HIGH SCORES LEADERBOARD
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', color: 'var(--color-text-dim)', fontSize: 10 }}>
              <th style={{ textAlign: 'left', paddingBottom: 6 }}>RANK</th>
              <th style={{ textAlign: 'left', paddingBottom: 6 }}>NAME</th>
              <th style={{ textAlign: 'center', paddingBottom: 6 }}>BUGS</th>
              <th style={{ textAlign: 'right', paddingBottom: 6 }}>SCORE</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.slice(0, 5).map((entry, index) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '4px 0', color: 'var(--color-amber)' }}>#{index + 1}</td>
                <td className="pixel-text" style={{ padding: '4px 0' }}>{entry.name}</td>
                <td style={{ textAlign: 'center', padding: '4px 0', color: 'var(--color-text-dim)' }}>{entry.bountiesFixed}</td>
                <td className="pixel-text neon-text-cyan" style={{ textAlign: 'right', padding: '4px 0' }}>
                  {entry.score.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn btn-primary animate-pulse" onClick={() => setScreen('game')} style={{ alignSelf: 'center' }}>
        Start Mission
      </button>

      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--color-text-dim)' }}>
        <span>Station: {stationId}</span><span style={{ margin: '0 8px' }}>·</span><span>Run: {runId.slice(0, 8)}</span>
      </div>
    </div>
  );
}
