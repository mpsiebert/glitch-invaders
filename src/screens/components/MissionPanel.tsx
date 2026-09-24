import React, { useState, useMemo, useEffect } from 'react';
import { useGameState } from '../../state/GameStateContext';
import { BOUNTY_DEFINITIONS } from '../../game/bugs/BugManager';
import { getInvestigateUrl, getTraceInvestigateUrl } from '../../sentry/links';
import type { BountyId } from '../../types';
import { EvidenceForm } from './EvidenceForm';
import { RepairSelector } from './RepairSelector';
import { HintSystem } from './HintSystem';
import {
  SCORE_EVIDENCE_NO_HINTS, SCORE_EVIDENCE_1_HINT,
  SCORE_EVIDENCE_2_HINTS, SCORE_EVIDENCE_3_HINTS, SCORE_REPAIR_FIRST_TRY,
  SCORE_REPAIR_SECOND_TRY, SCORE_VERIFICATION, SCORE_BOSS_BONUS,
} from '../../config/constants';

interface MissionPanelProps {
  bountyId: BountyId;
  onDismiss: () => void;
  onReplay: (bountyId: BountyId) => void;
  onComplete: () => void;
}

export function MissionPanel({ bountyId, onDismiss, onReplay, onComplete }: MissionPanelProps) {
  const {
    bounties, runId, isDemoMode, updateBountyPhase, addScore,
    incrementHints, attemptRepair, completeBounty, unlockNextBounty,
  } = useGameState();

  const bounty = bounties[bountyId];
  const definition = BOUNTY_DEFINITIONS[bountyId];
  const [repairFeedback, setRepairFeedback] = useState<string | null>(null);

  const isTraceBounty = bountyId === 'boss-buffering';
  const initialDelay = isTraceBounty ? 5 : 3;
  const [transmissionCount, setTransmissionCount] = useState<number>(initialDelay);

  useEffect(() => {
    if (transmissionCount <= 0) return;
    const timer = setInterval(() => {
      setTransmissionCount(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [transmissionCount]);

  const investigateLink = useMemo(() => {
    if (bountyId === 'boss-buffering') {
      return getTraceInvestigateUrl(bountyId, runId, bounty.traceId);
    }
    return getInvestigateUrl(bountyId, runId, bounty.eventId);
  }, [bountyId, runId, bounty.eventId, bounty.traceId]);

  const handleInvestigate = () => {
    if (investigateLink) window.open(investigateLink.url, '_blank');
    updateBountyPhase(bountyId, 'investigating');
  };

  const handleEvidenceSubmit = (answer: string) => {
    const normalized = answer.toLowerCase().trim();
    const accepted = definition.acceptedAnswers.map(a => a.toLowerCase());
    if (accepted.includes(normalized)) {
      const hints = bounty.hintsUsed;
      const points = hints === 0 ? SCORE_EVIDENCE_NO_HINTS
        : hints === 1 ? SCORE_EVIDENCE_1_HINT
        : hints === 2 ? SCORE_EVIDENCE_2_HINTS
        : SCORE_EVIDENCE_3_HINTS;
      addScore(points);
      updateBountyPhase(bountyId, 'repair-select');
      return true;
    }
    return false;
  };

  const handleRepairSelect = (repairId: number) => {
    const success = attemptRepair(bountyId, repairId);
    if (success) {
      addScore(bounty.repairAttempts === 0 ? SCORE_REPAIR_FIRST_TRY : SCORE_REPAIR_SECOND_TRY);
      setRepairFeedback(null);
      updateBountyPhase(bountyId, 'verifying');
    } else {
      setRepairFeedback('That repair didn\'t quite work. The bug is still present. Try another approach!');
    }
  };

  const handleStartReplay = () => onReplay(bountyId);

  const handleBountyComplete = () => {
    addScore(SCORE_VERIFICATION);
    if (bountyId === 'boss-buffering') addScore(SCORE_BOSS_BONUS);
    onComplete();
  };

  return (
    <div className="panel animate-slide-up" style={{ maxWidth: 600, maxHeight: '80vh', overflow: 'auto' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h2 className="pixel-text neon-text-magenta" style={{ fontSize: 14 }}>{definition.title}</h2>
          {definition.isOptional && <span className="badge badge-optional">Bonus</span>}
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-dim)', fontStyle: 'italic' }}>{definition.tagline}</p>
      </div>

      {bounty.phase === 'encountered' && (
        <div>
          <div style={{ background: 'rgba(255, 0, 255, 0.1)', border: '1px solid var(--color-magenta)', borderRadius: 4, padding: 16, marginBottom: 16 }}>
            <h3 className="pixel-text" style={{ fontSize: 10, color: 'var(--color-magenta)', marginBottom: 8 }}>🐛 Bug Discovered!</h3>
            <p style={{ fontSize: 14 }}>{definition.discoveryMessage}</p>
          </div>

          {isDemoMode ? (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--color-amber)', marginBottom: 8 }}>
                ⚠️ Demo Mode — Sentry is not connected. In a live setup, you would investigate this error in the Sentry dashboard.
              </p>
              <button className="btn btn-warning" onClick={() => updateBountyPhase(bountyId, 'investigating')}>Continue to Evidence</button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, marginBottom: 12 }}>
                The telemetry data is being sent to Sentry. Click below to investigate once transmission completes.<br />
                <span style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>The investigation opens in a new tab. Return here to submit your findings.</span>
              </p>
              
              {transmissionCount > 0 ? (
                <div style={{ marginBottom: 12, padding: 12, border: '1px dashed var(--color-cyan)', borderRadius: 4, textAlign: 'center', background: 'rgba(0, 255, 255, 0.05)' }}>
                  <span className="pixel-text neon-text-cyan animate-pulse" style={{ fontSize: 11 }}>
                    📡 Transmitting Telemetry to Sentry... ({transmissionCount}s)
                  </span>
                </div>
              ) : (
                <button className="btn btn-primary animate-pulse" onClick={handleInvestigate} style={{ width: '100%', padding: '14px 24px', fontSize: 14 }}>
                  🔍 Investigate in Sentry
                </button>
              )}

              {isTraceBounty && transmissionCount === 0 && (
                <p style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 8 }}>
                  ℹ️ Performance traces take a moment to index. If Sentry says "no spans found", wait 5s and refresh the Sentry tab!
                </p>
              )}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-small" onClick={() => updateBountyPhase(bountyId, 'investigating')} style={{ marginTop: 8 }}>
              Skip to Evidence Form →
            </button>
          </div>
        </div>
      )}

      {(bounty.phase === 'investigating' || bounty.phase === 'evidence') && (
        <div>
          {!isDemoMode && investigateLink && (
            <div style={{ marginBottom: 16 }}>
              <button className="btn btn-small" onClick={handleInvestigate}>🔍 Open Sentry again</button>
              {isTraceBounty ? (
                <p style={{ fontSize: 11, color: 'var(--color-amber)', marginTop: 4 }}>
                  ⏱️ Performance traces take ~10s to index in Sentry. If Sentry says "no spans found", refresh the Sentry tab!
                </p>
              ) : (
                <p style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 4 }}>Events may take a moment to appear in Sentry. Try refreshing.</p>
              )}
            </div>
          )}
          <EvidenceForm question={definition.evidenceQuestion} wrongHint={definition.wrongAnswerHint} onSubmit={handleEvidenceSubmit} />
          <HintSystem hints={definition.hints} hintsUsed={bounty.hintsUsed} onRevealHint={() => incrementHints(bountyId)} />
        </div>
      )}

      {bounty.phase === 'repair-select' && (
        <div>
          <p style={{ fontSize: 14, marginBottom: 16 }}>Great detective work! Now choose the right repair to fix the bug:</p>
          <RepairSelector repairs={definition.repairs} onSelect={handleRepairSelect} feedback={repairFeedback} />
        </div>
      )}

      {bounty.phase === 'verifying' && (
        <div style={{ textAlign: 'center' }}>
          <h3 className="pixel-text neon-text-green" style={{ fontSize: 12, marginBottom: 16 }}>Repair Applied!</h3>
          <p style={{ fontSize: 14, marginBottom: 20 }}>Let's replay the encounter to verify the fix works.</p>
          <button className="btn btn-success" onClick={handleStartReplay}>▶ Replay Encounter</button>
        </div>
      )}

      {bounty.phase === 'completed' && (
        <div style={{ textAlign: 'center' }}>
          <h3 className="pixel-text neon-text-green" style={{ fontSize: 14, marginBottom: 12 }}>✅ Bounty Complete!</h3>
          <p style={{ fontSize: 14, marginBottom: 20 }}>The bug has been fixed and verified. Well done!</p>
          <button className="btn btn-success" onClick={handleBountyComplete}>Continue Playing →</button>
        </div>
      )}
    </div>
  );
}
