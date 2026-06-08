<script lang="ts">
  import {
    difficulty,
    showHints,
    showLastMove,
    showLabels,
    isAIThinking,
    aiDiffLabel,
    aiGameStore,
    DIFFICULTY_DESCRIPTIONS
  } from '$lib/stores/aiGame';
  import { PIECES, opponent, isAttacked, findKing, moveToNotation } from '$lib/chess/engine';
  import ChessBoard from './ChessBoard.svelte';
  import StatusIndicator from './StatusIndicator.svelte';
  import type { Difficulty } from '$lib/types';
  import { boardThemeStore, setBoardTheme, showCaptureGuide, toggleCaptureGuide } from '$lib/stores/theme';
  import { getCaptureOpportunities } from '$lib/chess/analysis';

  // Subscribe to the aiGameStore
  const game = $derived($aiGameStore);

  // Derive the game status reactively
  const statusState = $derived.by(() => {
    if (game.isGameOver) {
      const kingPos = findKing(game.board, game.turn);
      if (kingPos) {
        const inCheck = isAttacked(game.board, kingPos[0], kingPos[1], opponent(game.turn));
        if (inCheck) {
          return {
            variant: 'checkmate' as const,
            text: game.turn === 'w' ? '♛ Checkmate! AI Wins!' : '♛ Checkmate! You Win!'
          };
        }
      }
      return {
        variant: 'checkmate' as const,
        text: '🤝 Stalemate — Draw'
      };
    }

    const kingPos = findKing(game.board, game.turn);
    if (kingPos && isAttacked(game.board, kingPos[0], kingPos[1], opponent(game.turn))) {
      return {
        variant: 'check' as const,
        text: '⚠ Check!'
      };
    }

    if (game.turn === 'w') {
      return {
        variant: 'white-turn' as const,
        text: '♙ Your Turn (White)'
      };
    } else {
      return {
        variant: 'black-turn' as const,
        text: '♟ AI Thinking...'
      };
    }
  });

  // Group move records into pairs for display in the log
  const movePairs = $derived.by(() => {
    const history = game.moveHistory;
    const pairs: Array<{ num: number; w: string; b?: string }> = [];
    for (let i = 0; i < history.length; i += 2) {
      const pair: { num: number; w: string; b?: string } = {
        num: Math.floor(i / 2) + 1,
        w: moveToNotation(history[i])
      };
      if (history[i + 1]) {
        pair.b = moveToNotation(history[i + 1]);
      }
      pairs.push(pair);
    }
    return pairs;
  });

  // Derived capture opportunities for active player's turn (White only in AI mode)
  const captureOpportunities = $derived.by(() => {
    if (!$showCaptureGuide) return [];
    if (game.turn === 'b') return [];
    return getCaptureOpportunities(game);
  });

  // Local auto-flip toggle
  let autoFlip = $state(false);
</script>

<div class="ai-play-layout">
  <div class="chess-layout">
    <div class="board-wrap">
      <!-- Captured by AI -->
      <div class="captured-info">
        <span class="captured-label">AI captured</span>
        <div class="captured-row">
          {#each game.capturedByBlack as piece}
            <span>{PIECES[piece]}</span>
          {/each}
        </div>
      </div>

      <!-- Player info strip (AI) -->
      <div class="player-info-strip top">
        <div class="player-meta">
          <span class="avatar">🤖</span>
          <div>
            <div class="name">ChessMind AI</div>
            <div class="sub-label">{$aiDiffLabel}</div>
          </div>
        </div>
        <div class="ai-thinking" class:visible={$isAIThinking}>
          <div class="thinking-dots"><span></span><span></span><span></span></div>
          Thinking...
        </div>
      </div>

      <!-- Main Chess Board -->
      <ChessBoard
        state={game}
        mode="ai"
        options={{
          showHints: $showHints,
          showLastMove: $showLastMove,
          showLabels: $showLabels,
          autoFlip
        }}
        onSquareClick={(r, f) => aiGameStore.handleSquareClick(r, f)}
      />

      <!-- Player info strip (User) -->
      <div class="player-info-strip bottom">
        <div class="player-meta">
          <span class="avatar">👤</span>
          <div>
            <div class="name">You (White)</div>
            <div class="sub-label">Human Player</div>
          </div>
        </div>
      </div>

      <!-- Captured by you -->
      <div class="captured-info">
        <span class="captured-label">You captured</span>
        <div class="captured-row">
          {#each game.capturedByWhite as piece}
            <span>{PIECES[piece]}</span>
          {/each}
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL CONTROLS -->
    <div class="right-panel">
      <!-- Status -->
      <div class="panel-card" style="padding: 12px 16px;">
        <div class="panel-card-title">Game Status</div>
        <StatusIndicator variant={statusState.variant} text={statusState.text} />
      </div>

      <!-- Learning Hub Capture Guide Sidebar Card -->
      {#if $showCaptureGuide && game.turn === 'w'}
        <div class="panel-card learning-guide-card">
          <div class="panel-card-title">Learning Hub: Capture Guide</div>
          <div class="guide-content">
            {#if captureOpportunities.length === 0}
              <div class="guide-tip empty">
                <span>💡</span>
                <p>No immediate captures. Develop your pieces or control center squares.</p>
              </div>
            {:else}
              <div class="guide-list" style="max-height: 150px; overflow-y: auto;">
                {#each captureOpportunities as opp}
                  <div class="guide-tip warning">
                    <span>💡</span>
                    <p>
                      <strong>Tactics Tip:</strong> Your {opp.piece} on <strong>{opp.notationFrom}</strong> can capture the {opp.target} on <strong>{opp.notationTo}</strong>.
                    </p>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Difficulty -->
      <div class="panel-card">
        <div class="panel-card-title">Difficulty</div>
        <div class="diff-buttons">
          {#each ['easy', 'medium', 'intermediate', 'hard'] as diffMode}
            <button
              class="diff-btn {diffMode}"
              class:active={$difficulty === diffMode}
              onclick={() => aiGameStore.setDifficulty(diffMode as Difficulty)}
            >
              {#if diffMode === 'easy'}🌱{:else if diffMode === 'medium'}⚔{:else if diffMode === 'intermediate'}🎯{:else}🏆{/if}
              {diffMode.charAt(0).toUpperCase() + diffMode.slice(1)}
            </button>
          {/each}
        </div>
        <div class="diff-desc">
          {DIFFICULTY_DESCRIPTIONS[$difficulty]}
        </div>
      </div>

      <!-- Options Toggles -->
      <div class="panel-card">
        <div class="panel-card-title">Options</div>
        <div class="toggle-row">
          <span class="toggle-label">Show Move Hints</span>
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="toggle" class:on={$showHints} onclick={() => showHints.set(!$showHints)}></div>
        </div>
        <div class="toggle-row">
          <span class="toggle-label">Piece Labels</span>
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="toggle" class:on={$showLabels} onclick={() => showLabels.set(!$showLabels)}></div>
        </div>
        <div class="toggle-row">
          <span class="toggle-label">Show Last Move</span>
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="toggle" class:on={$showLastMove} onclick={() => showLastMove.set(!$showLastMove)}></div>
        </div>
        <div class="toggle-row">
          <span class="toggle-label">Auto-flip Board</span>
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="toggle" class:on={autoFlip} onclick={() => autoFlip = !autoFlip}></div>
        </div>
        <div class="toggle-row">
          <span class="toggle-label">Show Capture Guide</span>
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="toggle" class:on={$showCaptureGuide} onclick={toggleCaptureGuide}></div>
        </div>
        <div class="theme-row">
          <span class="toggle-label">Board Theme</span>
          <div class="board-theme-picker">
            <button
              class="theme-picker-btn wood"
              class:active={$boardThemeStore === 'wood'}
              onclick={() => setBoardTheme('wood')}
              title="Classic Wood"
            ></button>
            <button
              class="theme-picker-btn blue"
              class:active={$boardThemeStore === 'blue'}
              onclick={() => setBoardTheme('blue')}
              title="Modern Blue"
            ></button>
            <button
              class="theme-picker-btn forest"
              class:active={$boardThemeStore === 'forest'}
              onclick={() => setBoardTheme('forest')}
              title="Minimalist Forest"
            ></button>
          </div>
        </div>
      </div>

      <!-- Move Log -->
      <div class="panel-card">
        <div class="panel-card-title">Move Log</div>
        <div class="move-log">
          {#if movePairs.length === 0}
            <span style="color: var(--text-muted); font-size: 11px;">Game not started — make your move.</span>
          {:else}
            {#each movePairs as pair}
              <div class="move-log-entry">
                <div class="move-num">{pair.num}.</div>
                <div class="move-white">{pair.w}</div>
                {#if pair.b}
                  <div class="move-black">{pair.b}</div>
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <!-- Actions buttons -->
      <div class="action-buttons">
        <button class="btn-sm" onclick={() => aiGameStore.undoMove()}>↩ Undo</button>
        <button class="btn-sm" onclick={() => aiGameStore.init()}>↺ New Game</button>
        <button class="btn-sm danger" onclick={() => aiGameStore.resign()}>⚑ Resign</button>
      </div>
    </div>
  </div>
</div>

<style>
  .ai-play-layout {
    display: flex;
    flex-direction: column;
  }

  .chess-layout {
    display: grid;
    grid-template-columns: auto 280px;
    gap: 20px;
    align-items: start;
  }

  .board-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .captured-info {
    width: 100%;
    padding: 6px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .captured-label {
    font-size: 11px;
    color: var(--text-muted);
    min-width: 80px;
  }

  .captured-row {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    min-height: 24px;
    font-size: 18px;
    line-height: 1;
  }

  .player-info-strip {
    width: 512px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    padding: 6px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .player-info-strip.top {
    border-radius: 8px 8px 0 0;
    margin-bottom: 0;
  }

  .player-info-strip.bottom {
    border-radius: 0 0 8px 8px;
    margin-top: 0;
  }

  .player-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .player-meta .avatar {
    font-size: 18px;
  }

  .player-meta .name {
    font-size: 12px;
    font-weight: 600;
  }

  .player-meta .sub-label {
    font-size: 10px;
    color: var(--text-muted);
  }

  .ai-thinking {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: rgba(74, 127, 165, 0.1);
    border: 1px solid rgba(74, 127, 165, 0.2);
    border-radius: 8px;
    font-size: 12px;
    color: var(--blue-light);
    display: none;
  }

  .ai-thinking.visible {
    display: flex;
  }

  .thinking-dots {
    display: flex;
    gap: 3px;
  }

  .thinking-dots span {
    width: 5px;
    height: 5px;
    background: var(--blue-light);
    border-radius: 50%;
    animation: blink 1.2s ease-in-out infinite;
  }

  .thinking-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .thinking-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0%,
    80%,
    100% {
      opacity: 0.2;
    }
    40% {
      opacity: 1;
    }
  }

  /* Right Panel */
  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .panel-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 18px;
  }

  .panel-card-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-muted);
    font-weight: 500;
    margin-bottom: 12px;
  }

  .diff-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .diff-btn {
    padding: 9px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-panel);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    text-align: center;
    transition: all 0.15s;
  }

  .diff-btn:hover {
    border-color: rgba(255, 255, 255, 0.15);
    color: var(--text-primary);
  }

  .diff-btn.active.easy {
    background: rgba(74, 144, 104, 0.2);
    border-color: rgba(74, 144, 104, 0.5);
    color: #6bcf96;
  }

  .diff-btn.active.medium {
    background: rgba(74, 127, 165, 0.2);
    border-color: rgba(74, 127, 165, 0.5);
    color: #6aa3d0;
  }

  .diff-btn.active.intermediate {
    background: rgba(196, 160, 87, 0.2);
    border-color: rgba(196, 160, 87, 0.4);
    color: var(--gold);
  }

  .diff-btn.active.hard {
    background: rgba(180, 80, 80, 0.2);
    border-color: rgba(180, 80, 80, 0.5);
    color: #e07070;
  }

  .diff-desc {
    margin-top: 10px;
    padding: 10px 12px;
    background: var(--bg-panel);
    border-radius: 8px;
    border: 1px solid var(--border);
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 0;
  }

  .toggle-row + .toggle-row {
    border-top: 1px solid var(--border);
  }

  .toggle-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .toggle {
    width: 36px;
    height: 20px;
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .toggle.on {
    background: var(--gold);
    border-color: var(--gold);
  }

  .toggle::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
  }

  .toggle.on::after {
    transform: translateX(16px);
  }

  .move-log {
    max-height: 120px;
    overflow-y: auto;
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: var(--text-secondary);
    line-height: 1.8;
  }

  .move-log-entry {
    display: flex;
    gap: 8px;
  }

  .move-num {
    color: var(--text-muted);
    min-width: 24px;
  }

  .move-white {
    color: var(--cream);
  }

  .move-black {
    color: var(--text-secondary);
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .btn-sm {
    padding: 7px 14px;
    border-radius: 7px;
    border: 1px solid var(--border);
    background: var(--bg-panel);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-sm:hover {
    border-color: var(--gold);
    color: var(--gold);
    background: var(--gold-dim);
  }

  .btn-sm.danger:hover {
    border-color: var(--danger-light);
    color: var(--danger-light);
    background: rgba(180, 80, 80, 0.1);
  }
</style>
