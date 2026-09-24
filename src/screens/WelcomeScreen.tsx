import React from 'react';
import { useGameState } from '../state/GameStateContext';

export function WelcomeScreen() {
  const { setScreen, isDemoMode, stationId, runId } = useGameState();

  return (
    <div className="arcade-cabinet" style={{ justifyContent: 'center', gap: 32, padding: 40 }}>
      <h1 className="pixel-text neon-text-cyan animate-glitch-loop" style={{ fontSize: 28, textAlign: 'center', letterSpacing: 4 }}>
        Glitch Invaders
      </h1>

      <div style={{ textAlign: 'center' }}>
        {isDemoMode ? <span className="badge badge-demo">Demo Mode</span> : <span className="badge badge-live">Live Sentry</span>}
      </div>

      <div className="panel" style={{ maxWidth: 600, textAlign: 'center' }}>
        <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          This cabinet shipped with <strong className="neon-text-amber">3 bugs</strong>.
          <br />Play to discover them. Use Sentry to investigate.
          <br />Apply repairs to restore the game.
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>
          Your mission takes about <strong>12 minutes</strong>.
        </p>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-dim)' }}>
        <p>⌨️ Arrow keys or WASD to move · Space to fire</p>
        <p style={{ marginTop: 4 }}>🖱️ On-screen controls also available</p>
      </div>

      <button className="btn btn-primary animate-pulse" onClick={() => setScreen('game')} style={{ alignSelf: 'center' }}>
        Start Mission
      </button>

      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--color-text-dim)', marginTop: 16 }}>
        <span>Station: {stationId}</span><span style={{ margin: '0 8px' }}>·</span><span>Run: {runId.slice(0, 8)}</span>
      </div>
    </div>
  );
}
