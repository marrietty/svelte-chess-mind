<script lang="ts">
  let { icon, title, subtitle, onplayAgain, onstudy }: {
    icon: string;
    title: string;
    subtitle: string;
    onplayAgain?: (e: CustomEvent<void>) => void;
    onstudy?: (e: CustomEvent<void>) => void;
  } = $props();

  function playAgain() {
    if (onplayAgain) {
      onplayAgain(new CustomEvent('playAgain'));
    }
  }

  function study() {
    if (onstudy) {
      onstudy(new CustomEvent('study'));
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="gameover-overlay">
  <div class="gameover-box" onclick={(e) => e.stopPropagation()}>
    <div class="gameover-icon">{icon}</div>
    <div class="gameover-title">{title}</div>
    <div class="gameover-sub">{subtitle}</div>
    <div class="gameover-actions">
      <button class="btn-primary" onclick={playAgain}>Play Again</button>
      <button class="btn-ghost" onclick={study}>Study Openings</button>
    </div>
  </div>
</div>

<style>
  .gameover-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gameover-box {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 16px;
    padding: 36px 40px;
    text-align: center;
    max-width: 340px;
  }

  .gameover-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }

  .gameover-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--gold-light);
    margin-bottom: 8px;
  }

  .gameover-sub {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  .gameover-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn-primary {
    padding: 10px 22px;
    background: var(--gold);
    color: #1a1208;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-primary:hover {
    background: var(--gold-light);
    transform: translateY(-1px);
  }

  .btn-ghost {
    padding: 10px 22px;
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-ghost:hover {
    border-color: var(--gold);
    color: var(--gold);
    background: var(--gold-dim);
  }
</style>
