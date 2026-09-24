import React from 'react';
import { useGameState } from '../../state/GameStateContext';

export function ResetControls() {
  const { resetRun, showInactivityWarning, setShowInactivityWarning } = useGameState();

  return (
    <>
      <button
        className="btn btn-danger btn-small"
        onClick={resetRun}
        style={{ position: 'fixed', top: 12, left: 12, zIndex: 60, opacity: 0.6 }}
        title="Restart station"
      >
        ↺ Restart
      </button>

      {showInactivityWarning && (
        <div className="overlay" style={{ zIndex: 200 }}>
          <div className="panel panel-amber animate-slide-up" style={{ maxWidth: 400, textAlign: 'center' }}>
            <h2 className="pixel-text neon-text-amber" style={{ fontSize: 14, marginBottom: 16 }}>Are you still there?</h2>
            <p style={{ fontSize: 14, marginBottom: 20 }}>The station will reset in 30 seconds if no response.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-success" onClick={() => setShowInactivityWarning(false)}>I'm still here!</button>
              <button className="btn btn-danger" onClick={resetRun}>Reset for next player</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
