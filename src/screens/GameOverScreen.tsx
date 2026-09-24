import React, { useState } from 'react';
import { useGameState } from '../state/GameStateContext';
import { getLeaderboard, saveLeaderboardEntry } from '../state/LeaderboardManager';

export function GameOverScreen() {
  const { score, bounties, resetRun } = useGameState();
  const [initials, setInitials] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState(getLeaderboard);

  const bountiesFixed = Object.values(bounties).filter(b => b.phase === 'completed').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || submitted) return;
    const updated = saveLeaderboardEntry(initials, score, bountiesFixed);
    setLeaderboard(updated);
    setSubmitted(true);
  };

  return (
    <div className="arcade-cabinet animate-fade-in" style={{ justifyContent: 'center', gap: 20, padding: 32, overflowY: 'auto' }}>
      <h1 className="pixel-text neon-text-red animate-shake" style={{ fontSize: 32, textAlign: 'center', letterSpacing: 4 }}>
        GAME OVER
      </h1>

      <div className="panel panel-red" style={{ maxWidth: 500, textAlign: 'center', width: '100%' }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 8 }}>Final Score</p>
        <div className="pixel-text neon-text-amber" style={{ fontSize: 24, marginBottom: 16 }}>
          {score.toLocaleString()} PTS
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>
          Bounties Repaired: {bountiesFixed} / 3
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} style={{ maxWidth: 500, width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label htmlFor="initials-input" style={{ fontSize: 13, textAlign: 'center' }}>
            Enter Initials for Leaderboard:
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="initials-input"
              className="input"
              type="text"
              maxLength={3}
              value={initials}
              onChange={e => setInitials(e.target.value.toUpperCase())}
              placeholder="AAA"
              style={{ textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: 18, letterSpacing: 4 }}
              autoFocus
            />
            <button className="btn btn-primary" type="submit" disabled={!initials.trim()}>
              Submit
            </button>
          </div>
        </form>
      ) : (
        <p className="neon-text-green" style={{ fontSize: 14, textAlign: 'center' }}>
          ✅ High Score Recorded!
        </p>
      )}

      {/* Leaderboard Table */}
      <div className="panel" style={{ maxWidth: 500, width: '100%' }}>
        <h3 className="pixel-text neon-text-cyan" style={{ fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
          🏆 Top High Scores
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', color: 'var(--color-text-dim)', fontSize: 11 }}>
              <th style={{ textAlign: 'left', paddingBottom: 8 }}>#</th>
              <th style={{ textAlign: 'left', paddingBottom: 8 }}>NAME</th>
              <th style={{ textAlign: 'center', paddingBottom: 8 }}>BUGS</th>
              <th style={{ textAlign: 'right', paddingBottom: 8 }}>SCORE</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '6px 0', color: 'var(--color-amber)' }}>{index + 1}</td>
                <td className="pixel-text" style={{ padding: '6px 0' }}>{entry.name}</td>
                <td style={{ textAlign: 'center', padding: '6px 0', color: 'var(--color-text-dim)' }}>{entry.bountiesFixed}</td>
                <td className="pixel-text neon-text-cyan" style={{ textAlign: 'right', padding: '6px 0' }}>
                  {entry.score.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn btn-primary btn-large animate-pulse" onClick={resetRun} style={{ alignSelf: 'center', marginTop: 12 }}>
        Try Again
      </button>
    </div>
  );
}
