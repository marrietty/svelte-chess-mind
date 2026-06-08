<script lang="ts">
  import { onMount } from 'svelte';
  import type { ViewId, GameMode, ScenarioId } from '$lib/types';

  // Layout components
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import Topbar from '$lib/components/layout/Topbar.svelte';

  // View components (lazy-mounted but always in DOM for state preservation)
  import DashboardView from '$lib/components/dashboard/DashboardView.svelte';
  import AIPlayView from '$lib/components/board/AIPlayView.svelte';
  import PvpView from '$lib/components/board/PvpView.svelte';
  import LearnView from '$lib/components/learn/LearnView.svelte';

  // Global overlays
  import PromotionOverlay from '$lib/components/overlays/PromotionOverlay.svelte';
  import GameOverOverlay from '$lib/components/overlays/GameOverOverlay.svelte';

  // Stores
  import { activeView, topbarMeta } from '$lib/stores/navigation';
  import { gameOverState } from '$lib/stores/gameOver';
  import { promotionState } from '$lib/stores/promotion';
  import { aiGameStore } from '$lib/stores/aiGame';
  import { pvpGameStore } from '$lib/stores/pvpGame';

  // ── Handlers threaded down from the overlay store callbacks ─────────────────

  function handleGameOverPlayAgain(): void {
    const mode: GameMode = $gameOverState.mode;
    gameOverState.hide();
    if (mode === 'ai') {
      aiGameStore.init();
    } else {
      pvpGameStore.init();
    }
  }

  function handleGameOverStudy(): void {
    gameOverState.hide();
    activeView.set('learn');
  }

  function handlePromoSelect(event: CustomEvent<{ piece: 'Q' | 'R' | 'B' | 'N' }>): void {
    const { piece } = event.detail;
    promotionState.resolve(piece);
  }

  // ── Boot: initialise both game states so boards are ready ───────────────────
  onMount(() => {
    aiGameStore.init();
    pvpGameStore.init();
  });
</script>

<div class="app-shell">
  <!-- ── Left Sidebar ───────────────────────────────────────────────────────── -->
  <Sidebar
    activeViewId={$activeView}
    onnavigate={(e: CustomEvent<{ viewId: ViewId }>) => activeView.set(e.detail.viewId)}
  />

  <!-- ── Main Column ────────────────────────────────────────────────────────── -->
  <div class="main">
    <Topbar
      title={$topbarMeta.title}
      breadcrumb={$topbarMeta.breadcrumb}
    />

    <!-- Views: always rendered (preserves game state), hidden via CSS -->
    <div class="view-container">
      <div class="view" class:active={$activeView === 'dashboard'}>
        <DashboardView onnavigate={(e: CustomEvent<{ viewId: ViewId }>) => activeView.set(e.detail.viewId)} />
      </div>

      <div class="view" class:active={$activeView === 'ai-play'}>
        <AIPlayView />
      </div>

      <div class="view" class:active={$activeView === 'pvp'}>
        <PvpView onstudy={() => activeView.set('learn')} />
      </div>

      <div class="view" class:active={$activeView === 'learn'}>
        <LearnView onloadScenario={(e: CustomEvent<{ scenarioId: ScenarioId }>) => {
          aiGameStore.loadScenario(e.detail.scenarioId);
          activeView.set('ai-play');
        }} />
      </div>
    </div>
  </div>
</div>

<!-- ── Global Overlays (portaled to body-level z-index) ─────────────────────── -->
{#if $promotionState.visible}
  <PromotionOverlay
    color={$promotionState.color}
    onselect={handlePromoSelect}
  />
{/if}

{#if $gameOverState.visible}
  <GameOverOverlay
    icon={$gameOverState.icon}
    title={$gameOverState.title}
    subtitle={$gameOverState.subtitle}
    onplayAgain={handleGameOverPlayAgain}
    onstudy={handleGameOverStudy}
  />
{/if}

<style>
  /* ── App shell layout ──────────────────────────────────────────────────────── */
  .app-shell {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--bg-void);
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Main column ───────────────────────────────────────────────────────────── */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0; /* prevent flex blowout */
  }

  /* ── View container / routing ──────────────────────────────────────────────── */
  .view-container {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .view {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 28px;
    /* Hidden by default — display toggled by .active */
    display: none;
  }

  .view.active {
    display: block;
  }

  /* ── Global scrollbar ──────────────────────────────────────────────────────── */
  :global(::-webkit-scrollbar) {
    width: 5px;
    height: 5px;
  }
  :global(::-webkit-scrollbar-track) {
    background: transparent;
  }
  :global(::-webkit-scrollbar-thumb) {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
</style>
