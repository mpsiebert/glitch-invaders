import React, { useState, useCallback } from 'react';
import type { RepairOption } from '../../types';

interface RepairSelectorProps {
  repairs: RepairOption[];
  onAttemptRepair: (repairId: number) => boolean;
  onApplyAndVerify: () => void;
}

export function RepairSelector({ repairs, onAttemptRepair, onApplyAndVerify }: RepairSelectorProps) {
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [correctId, setCorrectId] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState<string>('Select a repair patch option to test.');

  const handleSelect = useCallback((repair: RepairOption) => {
    // Prevent interaction if correct repair already selected
    if (correctId !== null) return;
    // Prevent double-click while applying
    if (applyingId !== null) return;
    // Prevent duplicate attempt count on clicking the same wrong card
    if (wrongIds.includes(repair.id)) return;

    setApplyingId(repair.id);

    // Brief timeout simulating code patch compilation & evaluation
    setTimeout(() => {
      const isCorrect = onAttemptRepair(repair.id);
      setApplyingId(null);

      if (isCorrect) {
        setCorrectId(repair.id);
        const msg = `Repair successful! ${repair.successExplanation || ''}`;
        setAnnouncement(msg);
      } else {
        setWrongIds(prev => [...prev, repair.id]);
        const msg = `Repair option ${repair.title} unsuccessful. ${repair.incorrectFeedback || ''} Please try another option.`;
        setAnnouncement(msg);
      }
    }, 250);
  }, [correctId, applyingId, wrongIds, onAttemptRepair]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Screen reader live region */}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <div role="radiogroup" aria-label="Repair patch options" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {repairs.map(repair => {
          const isApplying = applyingId === repair.id;
          const isWrong = wrongIds.includes(repair.id);
          const isCorrect = correctId === repair.id;
          const isSolved = correctId !== null;

          let cardClass = 'repair-card';
          if (isApplying) cardClass += ' applying';
          else if (isWrong) cardClass += ' incorrect animate-shake';
          else if (isCorrect) cardClass += ' correct animate-pulse';

          return (
            <button
              key={repair.id}
              type="button"
              role="radio"
              aria-checked={isCorrect || isApplying}
              aria-invalid={isWrong}
              aria-describedby={`repair-desc-${repair.id}`}
              disabled={isApplying || (isSolved && !isCorrect)}
              className={cardClass}
              onClick={() => handleSelect(repair)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <h4 style={{ fontSize: 14, color: isCorrect ? 'var(--color-green)' : isWrong ? '#ff8888' : 'var(--color-cyan)', margin: 0 }}>
                  {repair.title}
                </h4>
                {isApplying && (
                  <span className="badge badge-demo animate-pulse">⚙️ Testing Patch...</span>
                )}
                {isWrong && (
                  <span className="badge" style={{ background: 'rgba(255, 68, 68, 0.2)', color: '#ff4444', border: '1px solid #ff4444' }}>
                    ❌ Unsuccessful
                  </span>
                )}
                {isCorrect && (
                  <span className="badge badge-live">
                    ✅ Patch Verified
                  </span>
                )}
              </div>

              <p id={`repair-desc-${repair.id}`} style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 8 }}>
                {repair.description}
              </p>

              <pre className="code-snippet">{repair.codeSnippet}</pre>

              {/* In-card Incorrect Feedback */}
              {isWrong && (
                <div className="repair-feedback-box incorrect">
                  <strong style={{ display: 'block', marginBottom: 4 }}>❌ Repair Unsuccessful:</strong>
                  <p style={{ margin: 0, marginBottom: 6 }}>
                    {repair.incorrectFeedback || 'This solution does not fix the underlying bug.'}
                  </p>
                  <p style={{ fontSize: 11, opacity: 0.8, margin: 0, fontStyle: 'italic' }}>
                    👉 Inspect the remaining patch options above and try another approach.
                  </p>
                </div>
              )}

              {/* In-card Correct Feedback & Apply Button */}
              {isCorrect && (
                <div className="repair-feedback-box correct">
                  <strong style={{ display: 'block', marginBottom: 4 }}>✅ Repair Verified!</strong>
                  <p style={{ margin: 0, marginBottom: 12 }}>
                    {repair.successExplanation || 'The fix passes all system checks.'}
                  </p>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="btn btn-success animate-pulse"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyAndVerify();
                      }}
                      style={{ display: 'inline-block', cursor: 'pointer' }}
                    >
                      Apply Patch and Verify →
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
