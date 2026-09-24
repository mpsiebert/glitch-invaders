import React, { useCallback } from 'react';
import type { GameEngine } from '../../game/engine/GameEngine';

interface OnScreenControlsProps {
  engine: GameEngine | null;
}

export function OnScreenControls({ engine }: OnScreenControlsProps) {
  const handlePointerDown = useCallback((key: string) => {
    engine?.getInputManager().simulateKeyDown(key);
  }, [engine]);

  const handlePointerUp = useCallback((key: string) => {
    engine?.getInputManager().simulateKeyUp(key);
  }, [engine]);

  return (
    <div className="controls-container">
      <button
        className="control-btn"
        onPointerDown={() => handlePointerDown('left')}
        onPointerUp={() => handlePointerUp('left')}
        onPointerLeave={() => handlePointerUp('left')}
      >◀</button>
      <button
        className="control-btn"
        onPointerDown={() => handlePointerDown('right')}
        onPointerUp={() => handlePointerUp('right')}
        onPointerLeave={() => handlePointerUp('right')}
      >▶</button>
      <button
        className="control-btn control-btn-fire"
        onPointerDown={() => handlePointerDown('fire')}
        onPointerUp={() => handlePointerUp('fire')}
        onPointerLeave={() => handlePointerUp('fire')}
      >FIRE</button>
    </div>
  );
}
