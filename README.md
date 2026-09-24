# 🕹️ Glitch Invaders

A retro arcade space shooter that teaches Sentry debugging. Players discover three intentional bugs during gameplay, investigate them using Sentry's error monitoring and performance tracing, then apply code repairs to fix them.

Built for conference booths and workshops.

## Quick Start

```bash
npm ci
cp .env.example .env    # Edit with your Sentry credentials, or leave empty for demo mode
npm run dev              # Opens at http://localhost:5173
```

## Controls

| Action     | Keyboard        | On-Screen  |
|------------|-----------------|------------|
| Move left  | ← or A          | ◀ button   |
| Move right | → or D          | ▶ button   |
| Fire       | Space or Enter   | FIRE button|

## Game Modes

### Demo Mode (no Sentry)
Leave `VITE_SENTRY_DSN` empty. Bugs are discovered and repaired entirely in-game with simulated diagnostics logged to the browser console.

### Live Mode (Sentry connected)
Set `VITE_SENTRY_DSN`, `VITE_SENTRY_ORG`, and `VITE_SENTRY_PROJECT` in `.env`. Bugs generate real Sentry events with stack traces, breadcrumbs, and performance traces.

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable                  | Required | Description                          |
|---------------------------|----------|--------------------------------------|
| `VITE_SENTRY_DSN`         | No       | Sentry DSN. Omit for demo mode.      |
| `VITE_SENTRY_ORG`         | No       | Sentry organization slug.            |
| `VITE_SENTRY_PROJECT`     | No       | Sentry project slug.                 |
| `VITE_STATION_ID`         | No       | Station identifier (default: arcade-01). |
| `VITE_INACTIVITY_TIMEOUT_MS` | No    | Inactivity timeout in ms (default: 180000). |

## The Three Bugs

### 1. Triple Trouble (Error Monitoring)
A missing weapon configuration causes a `WeaponConfigError` when the player collects a triple-shot power-up. Players investigate the stack trace in Sentry to find the missing config key.

### 2. Friendly Fire (Breadcrumbs & Context)
The shield power-up multiplies damage ×3 instead of absorbing it. Players follow the breadcrumb trail and examine the diagnostic context in Sentry to understand the shield logic failure.

### 3. Boss Buffering (Performance Tracing)
Boss resources load sequentially with a redundant `loadAnimations` call. Players examine the performance trace waterfall to identify the bottleneck.

## Architecture

```
src/
├── config/          # Constants, environment helpers, Sentry init
├── game/
│   ├── bugs/        # Bug definitions, repair logic, Sentry reporting
│   ├── engine/      # GameEngine, Renderer, Input, Sound, Collision
│   └── weapons/     # Weapon configs and firing system
├── screens/         # React screen components (Welcome, Game, Completion)
│   └── components/  # HUD, MissionPanel, EvidenceForm, etc.
├── sentry/          # Telemetry, error reporting, URL helpers
├── state/           # React context, run manager, inactivity monitor
└── styles/          # Global CSS, arcade theme, animations
```

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Type-check and production build
npm run lint      # TypeScript type checking
npm test          # Run Vitest test suite
npm run preview   # Preview production build
```

## Testing

Tests use Vitest with jsdom. Run with:

```bash
npm test              # Single run
npm run test:watch    # Watch mode
```

Tests cover weapon behavior, shield damage calculations, bounty progression, collision detection, and environment configuration. The intentional bugs are explicitly tested to verify they exist before repair and behave correctly after repair.

## Production Build

```bash
npm run build
npm run preview
```

The build output is in `dist/`. Deploy to any static hosting provider.
