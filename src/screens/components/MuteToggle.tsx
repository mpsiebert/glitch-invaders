import React from 'react';
import { useGameState } from '../../state/GameStateContext';

export function MuteToggle() {
  const { isMuted, toggleMute } = useGameState();

  return (
    <button
      className="btn btn-small"
      onClick={toggleMute}
      style={{ position: 'fixed', top: 12, right: 12, zIndex: 60, fontSize: 16, padding: '8px 12px' }}
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? '🔇' : '🔊'}
    </button>
  );
}
