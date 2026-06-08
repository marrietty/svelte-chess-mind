<script lang="ts">
  import type { Color } from '$lib/types';

  let { color, onselect }: {
    color: Color;
    onselect?: (e: CustomEvent<{ piece: 'Q' | 'R' | 'B' | 'N' }>) => void;
  } = $props();

  const symbols: Record<string, string> = {
    wQ: '♕', wR: '♖', wB: '♗', wN: '♘',
    bQ: '♛', bR: '♜', bB: '♝', bN: '♞'
  };

  const pieces: ('Q' | 'R' | 'B' | 'N')[] = ['Q', 'R', 'B', 'N'];

  function selectPiece(piece: 'Q' | 'R' | 'B' | 'N') {
    if (onselect) {
      onselect(new CustomEvent('select', { detail: { piece } }));
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="promo-overlay">
  <div class="promo-box" onclick={(e) => e.stopPropagation()}>
    <div class="promo-title">Promote your pawn!</div>
    <div class="promo-pieces">
      {#each pieces as piece}
        <button class="promo-btn" onclick={() => selectPiece(piece)}>
          {symbols[color + piece]}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .promo-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .promo-box {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 14px;
    padding: 24px;
    text-align: center;
  }

  .promo-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: var(--cream);
    margin-bottom: 16px;
  }

  .promo-pieces {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .promo-btn {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg-panel);
    font-size: 36px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    color: var(--text-primary);
  }

  .promo-btn:hover {
    background: var(--gold-dim);
    border-color: var(--gold);
  }
</style>
