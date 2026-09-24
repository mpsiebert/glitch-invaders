import React from 'react';
import type { RepairOption } from '../../types';

interface RepairSelectorProps {
  repairs: RepairOption[];
  onSelect: (repairId: number) => void;
  feedback: string | null;
}

export function RepairSelector({ repairs, onSelect, feedback }: RepairSelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {repairs.map(repair => (
        <button key={repair.id} className="repair-card" onClick={() => onSelect(repair.id)} aria-label={repair.title}>
          <h4 style={{ fontSize: 14, marginBottom: 6, color: 'var(--color-cyan)' }}>{repair.title}</h4>
          <p style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 8 }}>{repair.description}</p>
          <pre className="code-snippet">{repair.codeSnippet}</pre>
        </button>
      ))}

      {feedback && (
        <p style={{ fontSize: 13, color: 'var(--color-red)', marginTop: 8 }}>{feedback}</p>
      )}
    </div>
  );
}
