import React, { useState } from 'react';

interface EvidenceFormProps {
  question: string;
  wrongHint: string;
  onSubmit: (answer: string) => boolean;
}

export function EvidenceForm({ question, wrongHint, onSubmit }: EvidenceFormProps) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    const correct = onSubmit(answer);
    if (correct) {
      setIsCorrect(true);
      setFeedback('✅ Correct! Great investigation work.');
    } else {
      setFeedback(`❌ Not quite. ${wrongHint}`);
    }
  };

  if (isCorrect) {
    return (
      <div style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid var(--color-green)', borderRadius: 4, padding: 16, marginBottom: 16 }}>
        <p className="neon-text-green" style={{ fontWeight: 'bold' }}>✅ Evidence accepted!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>{question}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className={`input ${feedback && !isCorrect ? 'input-error' : ''}`}
          type="text"
          value={answer}
          onChange={e => { setAnswer(e.target.value); setFeedback(null); }}
          placeholder="Type your answer..."
          autoFocus
        />
        <button className="btn" type="submit">Submit</button>
      </div>
      {feedback && (
        <p style={{ fontSize: 13, marginTop: 8, color: isCorrect ? 'var(--color-green)' : 'var(--color-red)' }}>{feedback}</p>
      )}
    </form>
  );
}
