<script lang="ts">
  import { themeStore, toggleTheme } from '$lib/stores/theme';
  let { title, breadcrumb }: { title: string; breadcrumb: string } = $props();

</script>

<div class="topbar">
  <div>
    <div class="topbar-title">{title}</div>
    <div class="topbar-breadcrumb">{breadcrumb}</div>
  </div>
  <div class="topbar-actions">
    <button class="theme-toggle-btn" onclick={toggleTheme} aria-label="Toggle Theme">
      {#if $themeStore === 'dark'}
        🌙 Dark Mode
      {:else}
        ☀️ Light Mode
      {/if}
    </button>
    <div class="badge-pill">Beta v0.9</div>
  </div>
</div>

<style>
  .topbar {
    height: 56px;
    padding: 0 28px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-deep);
    flex-shrink: 0;
  }

  .topbar-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .topbar-breadcrumb {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 1px;
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .badge-pill {
    padding: 4px 12px;
    background: var(--gold-dim);
    color: var(--gold);
    border: 1px solid rgba(196, 160, 87, 0.2);
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
  }
</style>
