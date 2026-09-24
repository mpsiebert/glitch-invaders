import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { BountyId, BountyState, ScreenType, BountyPhase } from '../types';
import { createInitialBounties, getNextActiveBounty, applyBountyRepair, resetAllBugs } from '../game/bugs/BugManager';
import { generateRunId } from './RunManager';
import { isDemoMode, getStationId } from '../config/environment';
import { setRunTags } from '../sentry/telemetry';
import { clearReportedBounties } from '../sentry/reporting';

interface GameStateContextValue {
  runId: string;
  screen: ScreenType;
  setScreen: (s: ScreenType) => void;
  isDemoMode: boolean;
  stationId: string;
  bounties: Record<BountyId, BountyState>;
  activeBounty: BountyId | null;
  updateBountyPhase: (id: BountyId, phase: BountyPhase) => void;
  setBountyEventId: (id: BountyId, eventId: string | null) => void;
  setBountyTraceId: (id: BountyId, traceId: string | null) => void;
  incrementHints: (id: BountyId) => void;
  attemptRepair: (id: BountyId, repairId: number) => boolean;
  completeBounty: (id: BountyId) => void;
  unlockNextBounty: () => void;
  score: number;
  addScore: (points: number) => void;
  lives: number;
  setLives: (l: number) => void;
  startTime: number;
  isMuted: boolean;
  toggleMute: () => void;
  showInactivityWarning: boolean;
  setShowInactivityWarning: (v: boolean) => void;
  resetRun: () => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export function useGameState(): GameStateContextValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within GameStateProvider');
  return ctx;
}

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [runId, setRunId] = useState(() => {
    const id = generateRunId();
    setRunTags(id);
    return id;
  });
  const [screen, setScreen] = useState<ScreenType>('welcome');
  const [bounties, setBounties] = useState<Record<BountyId, BountyState>>(createInitialBounties);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [startTime, setStartTime] = useState(Date.now());
  const [isMuted, setIsMuted] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  const demo = isDemoMode();
  const stationId = getStationId();
  const activeBounty = getNextActiveBounty(bounties);

  const updateBountyPhase = useCallback((id: BountyId, phase: BountyPhase) => {
    setBounties(prev => ({ ...prev, [id]: { ...prev[id], phase } }));
  }, []);

  const setBountyEventId = useCallback((id: BountyId, eventId: string | null) => {
    setBounties(prev => ({ ...prev, [id]: { ...prev[id], eventId } }));
  }, []);

  const setBountyTraceId = useCallback((id: BountyId, traceId: string | null) => {
    setBounties(prev => ({ ...prev, [id]: { ...prev[id], traceId } }));
  }, []);

  const incrementHints = useCallback((id: BountyId) => {
    setBounties(prev => ({ ...prev, [id]: { ...prev[id], hintsUsed: prev[id].hintsUsed + 1 } }));
  }, []);

  const addScore = useCallback((points: number) => { setScore(prev => prev + points); }, []);

  const attemptRepair = useCallback((id: BountyId, repairId: number): boolean => {
    const success = applyBountyRepair(id, repairId);
    setBounties(prev => ({
      ...prev, [id]: { ...prev[id], repairAttempts: prev[id].repairAttempts + 1, selectedRepair: repairId },
    }));
    return success;
  }, []);

  const completeBounty = useCallback((id: BountyId) => {
    setBounties(prev => ({ ...prev, [id]: { ...prev[id], phase: 'completed' } }));
  }, []);

  const unlockNextBounty = useCallback(() => {
    setBounties(prev => {
      const next = { ...prev };
      const order: BountyId[] = ['triple-trouble', 'friendly-fire', 'boss-buffering'];
      for (const id of order) {
        if (next[id].phase !== 'completed') {
          if (next[id].phase === 'locked') {
            next[id] = { ...next[id], phase: 'active' };
          }
          break;
        }
      }
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => { setIsMuted(prev => !prev); }, []);

  const resetRun = useCallback(() => {
    const newRunId = generateRunId();
    setRunTags(newRunId);
    setRunId(newRunId);
    setScreen('welcome');
    setBounties(createInitialBounties());
    setScore(0);
    setLives(3);
    setStartTime(Date.now());
    setShowInactivityWarning(false);
    resetAllBugs();
    clearReportedBounties();
  }, []);

  const value: GameStateContextValue = {
    runId, screen, setScreen, isDemoMode: demo, stationId,
    bounties, activeBounty, updateBountyPhase, setBountyEventId, setBountyTraceId,
    incrementHints, attemptRepair, completeBounty, unlockNextBounty,
    score, addScore, lives, setLives, startTime, isMuted, toggleMute,
    showInactivityWarning, setShowInactivityWarning, resetRun,
  };

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}
