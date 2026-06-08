<script lang="ts">
  let { piece, name, colorLabel, isActive }: {
    piece: string;
    name: string;
    colorLabel: string;
    isActive: boolean;
  } = $props();
</script>

<div class="player-strip" class:active-player={isActive}>
  <div class="player-piece">{piece}</div>
  <div class="player-info">
    <div class="player-name">{name}</div>
    <div class="player-color">{colorLabel}</div>
  </div>
</div>

<style>
  .player-strip {
    padding: 10px 16px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg-card);
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
</style>
