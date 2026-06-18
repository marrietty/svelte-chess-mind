<script lang="ts">
  import type { GameState, GameMode, BoardOptions } from '$lib/types';
  import { PIECE_IMAGES, opponent, isAttacked, findKing } from '$lib/chess/engine';
  import { boardThemeStore, showCaptureGuide } from '$lib/stores/theme';
  import { getCaptureOpportunities } from '$lib/chess/analysis';

  let { state, mode, options, onSquareClick }: {
    state: GameState;
    mode: GameMode;
    options: BoardOptions;
    onSquareClick: (rank: number, file: number) => void;
  } = $props();

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // Check if current king is in check reactively
  let isKingInCheck = $derived.by(() => {
    if (!state.board) return null;
    const kingPos = findKing(state.board, state.turn);
    if (!kingPos) return null;
    const underAttack = isAttacked(state.board, kingPos[0], kingPos[1], opponent(state.turn));
    return underAttack ? kingPos : null;
  });

  const lastMove = $derived(state.moveHistory[state.moveHistory.length - 1]);

  // Derived capture opportunities for active player's turn
  let captureOpp = $derived.by(() => {
    if (!$showCaptureGuide) return [];
    if (mode === 'ai' && state.turn === 'b') return []; // Only show for human player in AI mode
    return getCaptureOpportunities(state);
  });
</script>

<div class="board-container board-theme-{$boardThemeStore}">
  <div class="board-coords-wrap">
    <div style="width:16px"></div>
    <div class="board-files">
      {#each files as f}
        <div class="board-file-label">{f}</div>
      {/each}
    </div>
  </div>

  <div class="board-main-row">
    <div class="board-ranks">
      {#each Array(8) as _, r}
        <div class="board-rank-label">{8 - r}</div>
      {/each}
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="board">
      {#each Array(8) as _, r}
        {#each Array(8) as _, f}
          {@const cell = state.board[r][f]}
          {@const isSelected = state.selected && state.selected[0] === r && state.selected[1] === f}
          {@const isLastMoveFrom = options.showLastMove && lastMove && lastMove.fr === r && lastMove.ff === f}
          {@const isLastMoveTo = options.showLastMove && lastMove && lastMove.tr === r && lastMove.tf === f}
          {@const isHint = (options.showHints || mode === 'pvp') && state.legalMoves.some(m => m[0] === r && m[1] === f)}
          {@const isCheck = isKingInCheck && isKingInCheck[0] === r && isKingInCheck[1] === f}
          {@const isCapturer = !isSelected && captureOpp.some(o => o.fr === r && o.ff === f)}
          {@const isTarget = captureOpp.some(o => o.tr === r && o.tf === f)}

          <div
            class="square {(r + f) % 2 === 0 ? 'light' : 'dark'}"
            class:selected={isSelected}
            class:last-move-from={isLastMoveFrom}
            class:last-move-to={isLastMoveTo}
            class:hint={isHint}
            class:has-piece={isHint && cell !== null}
            class:in-check={isCheck}
            class:can-capture={isCapturer}
            class:can-be-captured={isTarget}
            onclick={() => onSquareClick(r, f)}
          >
            {#if cell}
              <div class="piece">
                <img class="piece-img" src={PIECE_IMAGES[cell]} alt={cell} />
              </div>
            {/if}
          </div>
        {/each}
      {/each}
    </div>
  </div>

  <div class="board-coords-wrap" style="margin-top:4px">
    <div style="width:16px"></div>
    <div class="board-files">
      {#each files as f}
        <div class="board-file-label">{f}</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .board-container {
    position: relative;
    user-select: none;
  }

  .board-coords-wrap {
    display: flex;
    gap: 0;
  }

  .board-files {
    display: flex;
    padding-left: 20px;
    margin-bottom: 4px;
  }

  .board-file-label {
    width: 64px;
    text-align: center;
    font-size: 10px;
    color: var(--text-muted);
    font-family: 'DM Mono', monospace;
  }

  .board-main-row {
    display: flex;
  }

  .board-ranks {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin-right: 4px;
  }

  .board-rank-label {
    height: 64px;
    display: flex;
    align-items: center;
    font-size: 10px;
    color: var(--text-muted);
    font-family: 'DM Mono', monospace;
    width: 16px;
    justify-content: flex-end;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(8, 64px);
    grid-template-rows: repeat(8, 64px);
    border: 2px solid rgba(196, 160, 87, 0.4);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(196, 160, 87, 0.05);
  }

  .square {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: background 0.3s ease;
    font-size: 42px;
    line-height: 1;
  }

  .square.light {
    background: var(--square-light);
  }

  .square.dark {
    background: var(--square-dark);
  }

  .square.selected {
    box-shadow: inset 0 0 0 3px rgba(240, 200, 80, 0.9);
  }

  .square.hint::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    background: var(--hint-dot);
    border-radius: 50%;
    pointer-events: none;
  }

  .square.hint.has-piece::after {
    content: '';
    position: absolute;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: transparent;
    border: 3px solid rgba(220, 80, 80, 0.85);
    box-shadow: 0 0 10px rgba(220, 80, 80, 0.5);
    pointer-events: none;
  }

  /* Pulsating gold/amber highlight for capturing piece */
  .square.can-capture {
    box-shadow: inset 0 0 0 3px var(--gold);
    animation: pulse-capture 2s infinite ease-in-out;
  }

  @keyframes pulse-capture {
    0%, 100% {
      background-color: rgba(196, 160, 87, 0.12);
    }
    50% {
      background-color: rgba(196, 160, 87, 0.3);
    }
  }

  /* Target enemy piece highlight */
  .square.can-be-captured {
    box-shadow: inset 0 0 0 3px #e07070;
    animation: pulse-target 2s infinite ease-in-out;
  }

  @keyframes pulse-target {
    0%, 100% {
      background-color: rgba(224, 112, 112, 0.12);
    }
    50% {
      background-color: rgba(224, 112, 112, 0.3);
    }
  }

  .square.last-move-from {
    background: rgba(205, 170, 70, 0.35) !important;
  }

  .square.last-move-to {
    background: rgba(205, 170, 70, 0.55) !important;
  }

  .square.in-check {
    background: rgba(200, 60, 60, 0.5) !important;
    animation: pulse-check 1.5s infinite alternate;
  }

  .piece {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    cursor: grab;
    transition: transform 0.05s;
    z-index: 2;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    user-select: none;
  }

  .piece-img {
    width: 86%;
    height: 86%;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
  }
</style>
