import React, { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/react';
import { GameStateProvider, useGameState } from './state/GameStateContext';
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
      {screen === 'welcome' && <WelcomeScreen />}
      {screen === 'game' && <GameScreen />}
      {screen === 'gameover' && <GameOverScreen />}
      {screen === 'completion' && <CompletionScreen />}
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
      <GameStateProvider>
        <AppContent />
      </GameStateProvider>
    </Sentry.ErrorBoundary>
  );
}
