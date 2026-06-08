<script lang="ts">
  import type { Board } from '$lib/types';
  import { PIECES } from '$lib/chess/engine';

  let { board }: { board: Board } = $props();
</script>

<div class="mini-board">
  {#each Array(8) as _, r}
    {#each Array(8) as _, f}
      {@const cell = board[r][f]}
      <div class="mini-sq {(r + f) % 2 === 0 ? 'light' : 'dark'}">
        {cell ? PIECES[cell] || '' : ''}
      </div>
    {/each}
  {/each}
</div>

<style>
  .mini-board {
    display: grid;
    grid-template-columns: repeat(8, 24px);
    grid-template-rows: repeat(8, 24px);
    margin-top: 12px;
    border: 1px solid rgba(196, 160, 87, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .mini-sq {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    line-height: 1;
    user-select: none;
  }

  .mini-sq.light {
    background: var(--square-light);
  }

  .mini-sq.dark {
    background: var(--square-dark);
  }
</style>
