import * as Sentry from '@sentry/react';
import type { BountyDefinition } from '../../types';
import { isDemoMode } from '../../config/environment';
import { addGameBreadcrumb } from '../../sentry/telemetry';

// ═══════════════════════════════════════════════════════
// INTENTIONAL BUG SITE: Boss Buffering (Bounty 3)
// Sequential resource loading with redundant loadAnimations.
// ═══════════════════════════════════════════════════════

let bossBufferingBugActive = true;

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadTextures(): Promise<void> { await simulateDelay(1200); }
async function loadSounds(): Promise<void> { await simulateDelay(1000); }
async function loadAnimations(): Promise<void> { await simulateDelay(1800); } // REDUNDANT
async function initializeAI(): Promise<void> { await simulateDelay(500); }

export async function spawnBossWithTracing(runId: string): Promise<string | null> {
  addGameBreadcrumb('game.boss', 'Boss spawn initiated', { sequential: bossBufferingBugActive });

  if (isDemoMode()) {
    console.log('[Demo] Would create boss-spawn trace');
    if (bossBufferingBugActive) {
      await loadTextures(); await loadSounds(); await loadAnimations(); await initializeAI();
    } else {
      await Promise.all([loadTextures(), loadSounds(), initializeAI()]);
    }
    return `demo-boss-trace-${Date.now().toString(36)}`;
  }

  let traceId: string | null = null;

  // startNewTrace() creates a completely fresh trace context, detaching from
  // the long-running pageload trace. This guarantees the boss-spawn trace
  // appears as its own root in Sentry's Trace View with only the four
  // resource-loading child spans visible.
  await Sentry.startNewTrace(async () => {
    await Sentry.startSpan(
      {
        name: 'boss-spawn',
        op: 'game.boss',
        forceTransaction: true,
        attributes: { 'run_id': runId, 'bounty_id': 'boss-buffering', 'bug_active': bossBufferingBugActive },
      },
      async (rootSpan) => {
        traceId = rootSpan.spanContext().traceId;
        if (bossBufferingBugActive) {
          // BUG: sequential loading with redundant loadAnimations
          await Sentry.startSpan({ name: 'loadTextures', op: 'game.resource.load' }, () => loadTextures());
          await Sentry.startSpan({ name: 'loadSounds', op: 'game.resource.load' }, () => loadSounds());
          await Sentry.startSpan({ name: 'loadAnimations', op: 'game.resource.load' }, () => loadAnimations());
          await Sentry.startSpan({ name: 'initializeAI', op: 'game.resource.load' }, () => initializeAI());
        } else {
          // FIXED: parallel loading without redundant loadAnimations
          await Sentry.startSpan({ name: 'parallelResourceLoad', op: 'game.resource.load' }, () =>
            Promise.all([
              Sentry.startSpan({ name: 'loadTextures', op: 'game.resource.load' }, () => loadTextures()),
              Sentry.startSpan({ name: 'loadSounds', op: 'game.resource.load' }, () => loadSounds()),
              Sentry.startSpan({ name: 'initializeAI', op: 'game.resource.load' }, () => initializeAI()),
            ])
          );
        }
      }
    );
  });

  addGameBreadcrumb('game.boss', 'Boss spawn complete', { traceId });
  return traceId;
}

export function applyRepair(repairId: number): boolean {
  if (repairId === 0) { bossBufferingBugActive = false; return true; }
  return false;
}

export function isRepairCorrect(repairId: number): boolean { return repairId === 0; }
export function resetBug(): void { bossBufferingBugActive = true; }

export const BOSS_BUFFERING_DEFINITION: BountyDefinition = {
  id: 'boss-buffering',
  title: 'Boss Buffering',
  tagline: 'The boss is taking forever to show up.',
  discoveryMessage:
    'The boss introduction stalled for several seconds! A performance trace was captured in Sentry. Find the "boss-spawn" trace and compare its child spans to find the bottleneck.',
  evidenceQuestion: 'Find the boss-spawn trace and compare its child spans. Enter the name of the longest operation.',
  acceptedAnswers: ['loadanimations', 'load-animations', 'load animations', 'loadAnimations', 'animations', 'load_animations'],
  wrongAnswerHint: 'Open the trace in Sentry and look at the waterfall view inside the "boss-spawn" root span. Four operations ran sequentially: loadTextures, loadSounds, loadAnimations, and initializeAI. Which one took the longest?',
  repairs: [
    {
      id: 0, title: 'Remove redundant loading + parallelize', isCorrect: true,
      description: 'Animations were already loaded at game start. Remove loadAnimations and run remaining loads in parallel.',
      codeSnippet: `// Remove redundant loadAnimations()\nawait Promise.all([\n  loadTextures(),\n  loadSounds(),\n  initializeAI(),\n]);`,
    },
    {
      id: 1, title: 'Parallelize all resource loading', isCorrect: false,
      description: 'Run all four operations in parallel. Faster, but still loads redundant animations.',
      codeSnippet: `await Promise.all([\n  loadTextures(),\n  loadSounds(),\n  loadAnimations(), // still redundant!\n  initializeAI(),\n]);`,
    },
    {
      id: 2, title: 'Add a resource cache check', isCorrect: false,
      description: 'Check if each resource is cached before loading. Adds complexity but keeps sequential loading.',
      codeSnippet: `if (!cache.has('textures')) await loadTextures();\nif (!cache.has('sounds')) await loadSounds();\nif (!cache.has('anims')) await loadAnimations();\nif (!cache.has('ai')) await initializeAI();`,
    },
  ],
  hints: [
    'Click "Open Sentry" and find the "boss-spawn" trace. Look at the waterfall view — four operations ran one after another. One is clearly longer than the rest.',
    'In the trace waterfall, you should see: loadTextures (~1.2s), loadSounds (~1.0s), loadAnimations (~1.8s), and initializeAI (~0.5s). Which took the longest?',
    'The answer is "loadAnimations". It takes ~1800ms and is redundant — animations were already loaded. Enter "loadAnimations" below.',
  ],
  isOptional: true,
};
