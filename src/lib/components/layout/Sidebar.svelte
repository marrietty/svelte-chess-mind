<script lang="ts">
  import type { ViewId } from '$lib/types';
  import { userStore, signOut } from '$lib/userStore.js';

  let { activeViewId, onnavigate }: {
    activeViewId: ViewId;
    onnavigate?: (e: CustomEvent<{ viewId: ViewId }>) => void;
  } = $props();

  function selectView(viewId: ViewId) {
    if (onnavigate) {
      onnavigate(new CustomEvent('navigate', { detail: { viewId } }));
    }
  }

  function getInitials(name: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  async function handleLogout() {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }
</script>

<aside class="sidebar">
  <div class="sidebar-logo">
    <div class="logo-mark">♛ ChessMind</div>
    <div class="logo-sub">AI Chess Platform</div>
  </div>

  <nav class="sidebar-nav">
    <div class="nav-section-label">Main</div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="nav-item"
      class:active={activeViewId === 'dashboard'}
      onclick={() => selectView('dashboard')}
    >
      <span class="nav-icon">📊</span> Dashboard
    </div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="nav-item"
      class:active={activeViewId === 'ai-play'}
      onclick={() => selectView('ai-play')}
    >
      <span class="nav-icon">🤖</span> AI Play Mode
    </div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="nav-item"
      class:active={activeViewId === 'pvp'}
      onclick={() => selectView('pvp')}
    >
      <span class="nav-icon">⚔</span> Player vs Player
    </div>

    <div class="nav-section-label">Learn</div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="nav-item"
      class:active={activeViewId === 'learn'}
      onclick={() => selectView('learn')}
    >
      <span class="nav-icon">📖</span> Learning Hub
    </div>

    <div class="nav-section-label">Account</div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="nav-item"
      class:active={activeViewId === 'progress'}
      onclick={() => selectView('progress')}
    >
      <span class="nav-icon">🏆</span> My Progress
    </div>
    <div class="nav-item disabled">
      <span class="nav-icon">⚙</span> Settings
    </div>
  </nav>

  <div class="sidebar-bottom">
    {#if $userStore}
      <div class="user-pill">
        {#if $userStore.avatarUrl}
          <img class="user-avatar-img" src={$userStore.avatarUrl} alt={$userStore.name} referrerpolicy="no-referrer" />
        {:else}
          <div class="user-avatar">{getInitials($userStore.name)}</div>
        {/if}
        <div class="user-info">
          <div class="user-name">{$userStore.name}</div>
          <div class="user-email">{$userStore.email}</div>
        </div>
      </div>
      <button class="logout-btn" onclick={handleLogout}>
        <span class="logout-icon">↩</span> Sign Out
      </button>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: var(--sidebar-w);
    min-width: var(--sidebar-w);
    background: var(--bg-deep);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-logo {
    padding: 28px 20px 20px;
    border-bottom: 1px solid var(--border);
  }

  .logo-mark {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--gold);
    letter-spacing: 0.5px;
    line-height: 1;
  }

  .logo-sub {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 4px;
    font-weight: 500;
  }

  .sidebar-nav {
    flex: 1;
    padding: 16px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
  }

  .nav-section-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 2px;
    padding: 10px 10px 4px;
    font-weight: 500;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 13.5px;
    font-weight: 400;
    transition: all 0.15s;
    border: 1px solid transparent;
    user-select: none;
  }

  .nav-item:hover:not(.disabled) {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .nav-item.active {
    background: var(--gold-dim);
    color: var(--gold-light);
    border-color: rgba(196, 160, 87, 0.2);
  }

  .nav-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nav-icon {
    font-size: 17px;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .sidebar-bottom {
    padding: 16px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .user-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: var(--bg-card);
    border-radius: 8px;
    border: 1px solid var(--border);
    overflow: hidden;
  }

  .user-avatar {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #4a7fa5, #6a5acd);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: white;
    flex-shrink: 0;
  }

  .user-avatar-img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .user-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .user-name {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    font-size: 10px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .logout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }

  .logout-btn:hover {
    border-color: var(--danger);
    color: var(--danger-light);
    background: rgba(160, 80, 80, 0.05);
  }

  .logout-icon {
    font-size: 12px;
  }
</style>
