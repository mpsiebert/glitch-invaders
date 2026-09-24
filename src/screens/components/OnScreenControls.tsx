import React, { useCallback } from 'react';
import type { GameEngine } from '../../game/engine/GameEngine';

interface OnScreenControlsProps {
  engine: GameEngine | null;
}

export function OnScreenControls({ engine }: OnScreenControlsProps) {
  const handlePointerDown = (key: string) => {
    engine?.getInputManager().simulateKeyDown(key);
  };

  const handlePointerUp = (key: string) => {
    engine?.getInputManager().simulateKeyUp(key);
  };

  return (
    <div className="controls-container">
      <button
        className="control-btn"
        onPointerDown={() => handlePointerDown('left')}
        onPointerUp={() => handlePointerUp('left')}
        onPointerLeave={() => handlePointerUp('left')}
        aria-label="Move left"
      >◀</button>
      <button
        className="control-btn"
        onPointerDown={() => handlePointerDown('right')}
        onPointerUp={() => handlePointerUp('right')}
        onPointerLeave={() => handlePointerUp('right')}
        aria-label="Move right"
      >▶</button>
      <button
        className="control-btn control-btn-fire"
        onPointerDown={() => handlePointerDown('fire')}
        onPointerUp={() => handlePointerUp('fire')}
        onPointerLeave={() => handlePointerUp('fire')}
        aria-label="Fire weapon"
      >FIRE</button>
    </div>
  );
}
