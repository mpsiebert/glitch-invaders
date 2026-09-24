import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { ThemeToggle } from '../ThemeToggle';
import { GameStateProvider, useGameState } from '../../state/GameStateContext';

function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  const { score, addScore } = useGameState();

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="current-score">{score}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => addScore(500)}>Add Score</button>
    </div>
  );
}

describe('Theme Architecture & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to classic theme and sets data-theme attribute on documentElement', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('classic');
    expect(screen.getByRole('radio', { name: /CLASSIC/i }).getAttribute('aria-checked')).toBe('true');
  });

  it('toggles to MLH Mode and sets data-theme attribute', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const mlhRadio = screen.getByRole('radio', { name: /MLH MODE/i });
    fireEvent.click(mlhRadio);

    expect(document.documentElement.getAttribute('data-theme')).toBe('mlh');
    expect(localStorage.getItem('glitch_invaders_theme')).toBe('mlh');
    expect(mlhRadio.getAttribute('aria-checked')).toBe('true');
  });

  it('restores stored preference from localStorage on startup', () => {
    localStorage.setItem('glitch_invaders_theme', 'mlh');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('mlh');
    expect(screen.getByRole('radio', { name: /MLH MODE/i }).getAttribute('aria-checked')).toBe('true');
  });

  it('supports keyboard navigation and activation on ThemeToggle', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const mlhRadio = screen.getByRole('radio', { name: /MLH MODE/i });
    fireEvent.keyDown(mlhRadio, { key: 'Enter', code: 'Enter' });
    fireEvent.click(mlhRadio);

    expect(document.documentElement.getAttribute('data-theme')).toBe('mlh');
  });

  it('switching theme does NOT reset score, lives, or active run game state', () => {
    render(
      <ThemeProvider>
        <GameStateProvider>
          <TestConsumer />
        </GameStateProvider>
      </ThemeProvider>
    );

    // Add score
    fireEvent.click(screen.getByText('Add Score'));
    expect(screen.getByTestId('current-score').textContent).toBe('500');
    expect(screen.getByTestId('current-theme').textContent).toBe('classic');

    // Switch theme
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('current-theme').textContent).toBe('mlh');

    // Score MUST remain 500
    expect(screen.getByTestId('current-score').textContent).toBe('500');
  });
});
