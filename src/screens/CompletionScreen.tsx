import React, { useMemo, useState } from 'react';
import { useGameState } from '../state/GameStateContext';
import { getLeaderboard, saveLeaderboardEntry } from '../state/LeaderboardManager';

export function CompletionScreen() {
  const { score, bounties, startTime, resetRun, isDemoMode } = useGameState();
  const [initials, setInitials] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState(getLeaderboard);

  const elapsed = useMemo(() => {
    const ms = Date.now() - startTime;
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [startTime]);

  const completedCount = Object.values(bounties).filter(b => b.phase === 'completed').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || submitted) return;
    const updated = saveLeaderboardEntry(initials, score, completedCount);
    setLeaderboard(updated);
    setSubmitted(true);
  };

  return (
    <div className="arcade-cabinet animate-fade-in" style={{ justifyContent: 'center', gap: 20, padding: 32, overflowY: 'auto' }}>
      <h1 className="pixel-text neon-text-green" style={{ fontSize: 24, textAlign: 'center' }}>
        Mission Complete!
      </h1>

      <div className="panel panel-green" style={{ maxWidth: 500, textAlign: 'center', width: '100%' }}>
        <div className="pixel-text neon-text-amber" style={{ fontSize: 20, marginBottom: 8 }}>
          {score.toLocaleString()} pts
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>
          Time: {elapsed} · Bugs Fixed: {completedCount}/3
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} style={{ maxWidth: 500, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="comp-initials" style={{ fontSize: 13, textAlign: 'center' }}>
            Submit your score to the Leaderboard:
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="comp-initials"
              className="input"
              type="text"
              maxLength={3}
              value={initials}
              onChange={e => setInitials(e.target.value.toUpperCase())}
              placeholder="AAA"
              style={{ textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: 18, letterSpacing: 4 }}
              autoFocus
            />
            <button className="btn btn-success" type="submit" disabled={!initials.trim()}>
              Save
            </button>
          </div>
        </form>
      ) : (
        <p className="neon-text-green" style={{ fontSize: 13, textAlign: 'center' }}>
          ✅ High Score Recorded!
        </p>
      )}

      {/* Leaderboard Table */}
      <div className="panel" style={{ maxWidth: 500, width: '100%' }}>
        <h3 className="pixel-text neon-text-amber" style={{ fontSize: 11, textAlign: 'center', marginBottom: 12 }}>
          🏆 Leaderboard
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', color: 'var(--color-text-dim)', fontSize: 10 }}>
              <th style={{ textAlign: 'left', paddingBottom: 4 }}>#</th>
              <th style={{ textAlign: 'left', paddingBottom: 4 }}>NAME</th>
              <th style={{ textAlign: 'center', paddingBottom: 4 }}>BUGS</th>
              <th style={{ textAlign: 'right', paddingBottom: 4 }}>SCORE</th>
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

      <button className="btn btn-primary btn-large" onClick={resetRun} style={{ alignSelf: 'center' }}>
        Next Player
      </button>
    </div>
  );
}
