import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameState } from '../state/GameStateContext';
import { GameEngine } from '../game/engine/GameEngine';
import type { BountyId, GameCallbacks } from '../types';
import { HUD } from './components/HUD';
import { MissionPanel } from './components/MissionPanel';
import { OnScreenControls } from './components/OnScreenControls';
import { MuteToggle } from './components/MuteToggle';
import { ResetControls } from './components/ResetControls';

export function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const {
    runId, bounties, activeBounty, score, addScore, lives, setLives,
    updateBountyPhase, setBountyEventId, setBountyTraceId,
    isMuted, setScreen, unlockNextBounty,
  } = useGameState();

  const [showMission, setShowMission] = useState(false);
  const [currentMissionBounty, setCurrentMissionBounty] = useState<BountyId | null>(null);

  const handleBugEncountered = useCallback((bountyId: BountyId, eventId: string | null) => {
    setBountyEventId(bountyId, eventId);
    updateBountyPhase(bountyId, 'encountered');
    setCurrentMissionBounty(bountyId);
    setShowMission(true);
  }, [setBountyEventId, updateBountyPhase]);

  const handleBugEncounteredWithTrace = useCallback((bountyId: BountyId, traceId: string | null) => {
    setBountyTraceId(bountyId, traceId);
    updateBountyPhase(bountyId, 'encountered');
    setCurrentMissionBounty(bountyId);
    setShowMission(true);
  }, [setBountyTraceId, updateBountyPhase]);

  const handleScoreChange = useCallback((delta: number) => { addScore(delta); }, [addScore]);
  const handleLivesChange = useCallback((newLives: number) => { setLives(newLives); }, [setLives]);

  const handleBossDefeated = useCallback(() => {
    setTimeout(() => setScreen('completion'), 2000);
  }, [setScreen]);

  const bountiesRef = useRef(bounties);
  useEffect(() => { bountiesRef.current = bounties; }, [bounties]);

  const handleAllEnemiesCleared = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (bountiesRef.current['friendly-fire'].phase === 'completed') {
      engine.startBossWave();
    } else {
      engine.spawnEnemyWave();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const callbacks: GameCallbacks = {
      onBugEncountered: handleBugEncountered,
      onBugEncounteredWithTrace: handleBugEncounteredWithTrace,
      onVerificationResult: () => {}, // unused directly since we poll
      onScoreChange: handleScoreChange,
      onLivesChange: handleLivesChange,
      onBossDefeated: handleBossDefeated,
      onAllEnemiesCleared: handleAllEnemiesCleared,
    };

    const engine = new GameEngine(canvas, callbacks, runId);
    engineRef.current = engine;
    engine.start();

    return () => { engine.destroy(); engineRef.current = null; };
  }, [runId]); 

  useEffect(() => {
    const engine = engineRef.current;
    if (engine) engine.sound.muted = isMuted;
  }, [isMuted]);

  const handleMissionDismiss = useCallback(() => {
    setShowMission(false);
    const engine = engineRef.current;
    if (engine) engine.resume();
  }, []);

  const handleReplayEncounter = useCallback((bountyId: BountyId) => {
    const engine = engineRef.current;
    if (engine) {
      setShowMission(false);
      engine.replayBugEncounter(bountyId);

      const checkInterval = setInterval(() => {
        const result = engine.checkVerification();
        if (result) {
          clearInterval(checkInterval);
          setCurrentMissionBounty(result.bountyId);
          if (result.success) {
            updateBountyPhase(result.bountyId, 'completed');
            unlockNextBounty();
          }
          setShowMission(true);
        }
      }, 500);

      setTimeout(() => clearInterval(checkInterval), 15000);
    }
  }, [updateBountyPhase, unlockNextBounty]);

  const handleSkipToNextBug = useCallback(() => {
    const engine = engineRef.current;
    if (engine && activeBounty) engine.skipToNextBug(activeBounty);
  }, [activeBounty]);

  const handleCompleteMission = useCallback(() => {
    setShowMission(false);
    const engine = engineRef.current;
    if (engine) engine.resume();
    
    if (bounties['triple-trouble'].phase === 'completed' && bounties['friendly-fire'].phase === 'completed') {
      if (bounties['boss-buffering'].phase === 'completed') {
        setScreen('completion');
      }
    }
  }, [bounties, setScreen]);

  return (
    <div className="arcade-cabinet" style={{ position: 'relative' }}>
      <HUD score={score} lives={lives} bounties={bounties} activeBounty={activeBounty} />

      <canvas
        ref={canvasRef}
        style={{ border: '1px solid rgba(0, 255, 255, 0.3)', borderRadius: 4, maxWidth: '100%', maxHeight: 'calc(100vh - 200px)' }}
      />

      {activeBounty && !showMission && (
        <button className="btn btn-warning btn-small" onClick={handleSkipToNextBug} style={{ position: 'absolute', bottom: 100, right: 16 }}>
          Jump to next bug →
        </button>
      )}

      <OnScreenControls engine={engineRef.current} />
      <MuteToggle />
      <ResetControls />

      {showMission && currentMissionBounty && (
        <div className="overlay">
          <MissionPanel
            bountyId={currentMissionBounty}
            onDismiss={handleMissionDismiss}
            onReplay={handleReplayEncounter}
            onComplete={handleCompleteMission}
          />
        </div>
      )}
    </div>
  );
}
