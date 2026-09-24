import React from 'react';
import { useTheme } from './ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Visual Theme Toggle"
      className="theme-toggle-container"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        borderRadius: '4px',
        gap: '2px',
        zIndex: 50,
      }}
    >
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'classic'}
        className={`theme-toggle-btn ${theme === 'classic' ? 'active' : ''}`}
        onClick={() => setTheme('classic')}
      >
        CLASSIC
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'mlh'}
        className={`theme-toggle-btn ${theme === 'mlh' ? 'active' : ''}`}
        onClick={() => setTheme('mlh')}
      >
        MLH MODE
      </button>
    </div>
  );
}
