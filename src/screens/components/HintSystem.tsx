import React from 'react';

interface HintSystemProps {
  hints: [string, string, string];
  hintsUsed: number;
  onRevealHint: () => void;
}

export function HintSystem({ hints, hintsUsed, onRevealHint }: HintSystemProps) {
  return (
    <div style={{ marginTop: 16 }}>
      {Array.from({ length: Math.min(hintsUsed, 3) }).map((_, i) => (
        <div key={i} className="hint-reveal" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, opacity: 0.7 }}>Hint {i + 1}:</span>
          <p style={{ fontSize: 13, marginTop: 4 }}>{hints[i]}</p>
        </div>
      ))}

      {hintsUsed < 3 && (
        <button className="btn btn-warning btn-small" onClick={onRevealHint} style={{ marginTop: 8 }}>
          💡 Need a hint? ({3 - hintsUsed} remaining)
        </button>
      )}

      {hintsUsed > 0 && hintsUsed < 3 && (
        <p style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 4 }}>Using fewer hints earns more points.</p>
      )}
    </div>
  );
}
