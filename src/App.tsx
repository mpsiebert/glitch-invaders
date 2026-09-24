import React, { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/react';
import { GameStateProvider, useGameState } from './state/GameStateContext';
import { ThemeProvider } from './theme/ThemeContext';
import { ThemeToggle } from './theme/ThemeToggle';
import { InactivityMonitor } from './state/InactivityMonitor';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { GameScreen } from './screens/GameScreen';
import { CompletionScreen } from './screens/CompletionScreen';
import { GameOverScreen } from './screens/GameOverScreen';

function AppContent() {
  const { screen, resetRun, setShowInactivityWarning } = useGameState();
  const monitorRef = useRef<InactivityMonitor | null>(null);

  useEffect(() => {
    const monitor = new InactivityMonitor();
    monitorRef.current = monitor;
    monitor.start(
      () => setShowInactivityWarning(true),
      () => resetRun()
    );
    return () => { monitor.destroy(); monitorRef.current = null; };
  }, [resetRun, setShowInactivityWarning]);

  return (
    <div className="arcade-cabinet">
      {/* Theme Toggle at Upper Right */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 90 }}>
        <ThemeToggle />
      </div>

      {screen === 'welcome' && <WelcomeScreen />}
      {screen === 'game' && <GameScreen />}
      {screen === 'gameover' && <GameOverScreen />}
      {screen === 'completion' && <CompletionScreen />}

      <footer style={{ position: 'fixed', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'var(--color-text-dim)', zIndex: 40, pointerEvents: 'none' }}>
        Made with <span style={{ color: '#ff4444', display: 'inline-block' }}>♥</span> by the MLH Team
      </footer>
    </div>
  );
}

function ErrorFallback({ error, resetError }: { error: unknown; resetError: () => void }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="arcade-cabinet" style={{ justifyContent: 'center', gap: 20 }}>
      <h1 className="pixel-text neon-text-red" style={{ fontSize: 16 }}>System Error</h1>
      <div className="panel" style={{ maxWidth: 500 }}>
        <p style={{ marginBottom: 12 }}>{message}</p>
        <button className="btn btn-primary" onClick={resetError}>Reboot</button>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Sentry.ErrorBoundary fallback={({ error, resetError }) => <ErrorFallback error={error} resetError={resetError} />}>
      <ThemeProvider>
        <GameStateProvider>
          <AppContent />
        </GameStateProvider>
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
}
