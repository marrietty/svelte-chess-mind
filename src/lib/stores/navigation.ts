import { derived, writable } from 'svelte/store';
import type { ViewId } from '$lib/types';

// ── Title/breadcrumb map ──────────────────────────────────────────────────────

const VIEW_TITLES: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  'ai-play': 'AI Play Mode',
  pvp:       'Player vs Player',
  learn:     'Learning Hub',
};

const VIEW_BREADCRUMBS: Record<ViewId, string> = {
  dashboard: 'ChessMind / Home',
  'ai-play': 'ChessMind / AI Mode',
  pvp:       'ChessMind / Local Match',
  learn:     'ChessMind / Learning Hub',
};

// ── Active view ───────────────────────────────────────────────────────────────

export const activeView = writable<ViewId>('dashboard');

// ── Derived topbar meta ───────────────────────────────────────────────────────

export const topbarMeta = derived(activeView, ($view) => ({
  title:      VIEW_TITLES[$view]      ?? $view,
  breadcrumb: VIEW_BREADCRUMBS[$view] ?? '',
}));
