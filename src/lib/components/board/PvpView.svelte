<script lang="ts">
  import { pvpGameStore } from '$lib/stores/pvpGame';
  import { PIECE_IMAGES, opponent, isAttacked, findKing, moveToNotation } from '$lib/chess/engine';
  import ChessBoard from './ChessBoard.svelte';
  import StatusIndicator from './StatusIndicator.svelte';
  import { boardThemeStore, setBoardTheme, showCaptureGuide, toggleCaptureGuide } from '$lib/stores/theme';
  import { getCaptureOpportunities } from '$lib/chess/analysis';

  let { onstudy }: {
    onstudy?: (e: CustomEvent<void>) => void;
  } = $props();

  const game = $derived($pvpGameStore);

  // Derive the match status reactively
  const statusState = $derived.by(() => {
    if (game.isGameOver) {
      const kingPos = findKing(game.board, game.turn);
      if (kingPos) {
        const inCheck = isAttacked(game.board, kingPos[0], kingPos[1], opponent(game.turn));
        if (inCheck) {
          return {
            variant: 'checkmate' as const,
            text: game.turn === 'w' ? '♛ Checkmate! Player 2 Wins!' : '♛ Checkmate! Player 1 Wins!'
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
        text: '♔ Player 1 to Move'
      };
    } else {
      return {
        variant: 'black-turn' as const,
        text: '♚ Player 2 to Move'
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

  // Derived capture opportunities for active player's turn
  const captureOpportunities = $derived.by(() => {
    if (!$showCaptureGuide) return [];
    return getCaptureOpportunities(game);
  });

  // Auto-record game win reactively
  let lastMoveCount = $state(-1);

  $effect(() => {
    if (game.isGameOver) {
      if (game.moveHistory.length !== lastMoveCount) {
        const c = game.turn;
        const opp = opponent(c);
        const kingPos = findKing(game.board, c);
        const inCheck = kingPos ? isAttacked(game.board, kingPos[0], kingPos[1], opp) : false;

        let winner: 'Player 1' | 'Player 2' | 'Draw' = 'Draw';
        let result: 'Checkmate' | 'Stalemate' | 'Resign' = 'Stalemate';

        if (inCheck) {
          winner = opp === 'w' ? 'Player 1' : 'Player 2';
          result = 'Checkmate';
        }

        pvpGameStore.recordWin(winner, result);
        lastMoveCount = game.moveHistory.length;
      }
    } else {
      if (game.moveHistory.length === 0) {
        lastMoveCount = -1;
      }
    }
  });

  function study() {
    if (onstudy) {
      onstudy(new CustomEvent('study'));
    }
  }
</script>

<div class="pvp-view">
  <div class="pvp-layout">
    <div class="board-wrap">
      <!-- Black player strip -->
      <div class="player-strip" class:active-player={game.turn === 'b' && !game.isGameOver}>
        <div class="player-piece">♚</div>
        <div class="player-info">
          <div class="player-name">Player 2 (Black)</div>
          <div class="player-color">
            {game.turn === 'b' && !game.isGameOver ? 'Your turn to move' : 'Waiting for their turn'}
          </div>
        </div>
      </div>

      <!-- Captured by Black -->
      <div class="captured-info top">
        <span class="captured-label">Captured</span>
        <div class="captured-row">
          {#each game.capturedByWhite as piece}
            <img src={PIECE_IMAGES[piece]} alt={piece} class="captured-piece-img" />
          {/each}
        </div>
      </div>

      <!-- Chess Board -->
      <ChessBoard
        state={game}
        mode="pvp"
        options={{
          showHints: true,
          showLastMove: true,
          showLabels: false,
          autoFlip: false
        }}
        onSquareClick={(r, f) => pvpGameStore.handleSquareClick(r, f)}
      />

      <!-- Captured by White -->
      <div class="captured-info bottom">
        <span class="captured-label">Captured</span>
        <div class="captured-row">
          {#each game.capturedByBlack as piece}
            <img src={PIECE_IMAGES[piece]} alt={piece} class="captured-piece-img" />
          {/each}
        </div>
      </div>

      <!-- White player strip -->
      <div class="player-strip" class:active-player={game.turn === 'w' && !game.isGameOver}>
        <div class="player-piece">♔</div>
        <div class="player-info">
          <div class="player-name">Player 1 (White)</div>
          <div class="player-color">
            {game.turn === 'w' && !game.isGameOver ? 'Your turn to move' : 'Waiting for their turn'}
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL CONTROLS -->
    <div class="right-panel">
      <!-- Status -->
      <div class="panel-card" style="padding: 12px 16px;">
        <div class="panel-card-title">Match Status</div>
        <StatusIndicator variant={statusState.variant} text={statusState.text} />
      </div>

      <!-- Learning Hub Capture Guide Sidebar Card -->
      {#if $showCaptureGuide && !game.isGameOver}
        <div class="panel-card learning-guide-card">
          <div class="panel-card-title">Learning Hub: Capture Guide</div>
          <div class="guide-content">
            {#if captureOpportunities.length === 0}
              <div class="guide-tip empty">
                <span>💡</span>
                <p>No immediate captures. Settle your position or develop your pieces.</p>
              </div>
            {:else}
              <div class="guide-list" style="max-height: 150px; overflow-y: auto;">
                {#each captureOpportunities as opp}
                  <div class="guide-tip warning">
                    <span>💡</span>
                    <p>
                      <strong>Tactics Tip:</strong> ({game.turn === 'w' ? 'Player 1' : 'Player 2'}) Your {opp.piece} on <strong>{opp.notationFrom}</strong> can capture the {opp.target} on <strong>{opp.notationTo}</strong>.
                    </p>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Active Rules -->
      <div class="panel-card">
        <div class="panel-card-title">Active Rules</div>
        <div class="rule-notice">✓ Legal moves only enforced</div>
        <div class="rule-notice">✓ Automatic check detection active</div>
        <div class="rule-notice">✓ Promotion dialog enabled</div>
      </div>

      <!-- Options Card -->
      <div class="panel-card">
        <div class="panel-card-title">Options</div>
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

      <!-- Win tracker score display -->
      <div class="wins-tracker">
        <div class="panel-card-title" style="margin: 0 0 4px;">Session Score</div>
        <div class="wins-score">
          <div style="text-align: center;">
            <div class="wins-num">{game.p1Wins}</div>
            <div class="wins-name">♔ Player 1</div>
          </div>
          <div class="wins-sep">—</div>
          <div style="text-align: center;">
            <div class="wins-num">{game.p2Wins}</div>
            <div class="wins-name">♚ Player 2</div>
          </div>
        </div>
        <div class="panel-card-title" style="margin-top: 10px;">Game History</div>
        <div class="game-history-list">
          {#if game.gameHistory.length === 0}
            <div style="font-size: 12px; color: var(--text-muted); font-style: italic;">No games completed yet.</div>
          {:else}
            {#each game.gameHistory.slice(0, 8) as g, i}
              {@const cls = g.winner === 'Player 1' ? 'white-win' : g.winner === 'Player 2' ? 'black-win' : 'draw'}
              <div class="history-item">
                <div class="history-badge {cls}"></div>
                Game {game.gameHistory.length - i}: {g.winner === 'Draw' ? 'Draw' : `${g.winner} wins`} by {g.result}
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <!-- Move Log -->
      <div class="panel-card">
        <div class="panel-card-title">Move Log</div>
        <div class="move-log">
          {#if movePairs.length === 0}
            <span style="color: var(--text-muted); font-size: 11px;">Game not started — Player 1 makes the first move.</span>
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

      <!-- Study Link -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="study-link" onclick={study}>
        📖 <span>Study before your next move →</span>
      </div>

      <!-- Actions -->
      <div class="action-buttons">
        <button class="btn-sm" onclick={() => pvpGameStore.undoMove()}>↩ Undo</button>
        <button class="btn-sm" onclick={() => pvpGameStore.init()}>↺ New Game</button>
      </div>
    </div>
  </div>
</div>

<style>
  .pvp-view {
    display: flex;
    flex-direction: column;
  }

  .pvp-layout {
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

  .player-strip {
    width: 512px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .player-strip.active-player {
    border-color: var(--border-glow);
    background: var(--gold-dim);
  }

  .player-piece {
    font-size: 24px;
    line-height: 1;
  }

  .player-info {
    flex: 1;
  }

  .player-name {
    font-size: 13px;
    font-weight: 600;
  }

  .player-color {
    font-size: 11px;
    color: var(--text-muted);
  }

  .captured-info {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .captured-info.top {
    padding: 4px 6px;
    margin-bottom: 6px;
  }

  .captured-info.bottom {
    padding: 6px 6px 4px;
    margin-top: 6px;
  }

  .captured-label {
    font-size: 10px;
    color: var(--text-muted);
    min-width: 60px;
  }

  .captured-row {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    min-height: 24px;
    font-size: 18px;
    line-height: 1;
    align-items: center;
  }

  .captured-piece-img {
    height: 20px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
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

  .rule-notice {
    background: rgba(74, 127, 165, 0.08);
    border: 1px solid rgba(74, 127, 165, 0.2);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12px;
    color: var(--blue-light);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .wins-tracker {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 18px;
  }

  .wins-score {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin: 12px 0;
  }

  .wins-num {
    font-family: 'Playfair Display', serif;
    font-size: 40px;
    font-weight: 700;
    color: var(--cream);
    line-height: 1;
  }

  .wins-sep {
    font-size: 20px;
    color: var(--text-muted);
  }

  .wins-name {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;
  }

  .game-history-list {
    max-height: 120px;
    overflow-y: auto;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 0;
    font-size: 12px;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border);
  }

  .history-item:last-child {
    border-bottom: none;
  }

  .history-badge {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .history-badge.white-win {
    background: var(--cream);
  }

  .history-badge.black-win {
    background: var(--text-muted);
  }

  .history-badge.draw {
    background: var(--gold);
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

  .study-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--gold-dim);
    border: 1px solid rgba(196, 160, 87, 0.2);
    border-radius: 8px;
    color: var(--gold);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .study-link:hover {
    background: rgba(196, 160, 87, 0.25);
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 14px;
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
</style>
