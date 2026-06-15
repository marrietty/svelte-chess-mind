<script lang="ts">
  import { themeStore, toggleTheme } from '$lib/stores/theme';
  import { userStore, signInWithGoogle, signOut } from '$lib/userStore.js';

  let { title, breadcrumb }: { title: string; breadcrumb: string } = $props();

  let signingIn = $state(false);

  function getInitials(name: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  async function handleLogin() {
    signingIn = true;
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in failed:', err);
      signingIn = false;
    }
  }

  async function handleLogout() {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  }
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

    {#if $userStore}
      <div class="user-profile-group">
        {#if $userStore.avatarUrl}
          <img class="user-avatar" src={$userStore.avatarUrl} alt={$userStore.name} referrerpolicy="no-referrer" />
        {:else}
          <div class="user-avatar placeholder">{getInitials($userStore.name)}</div>
        {/if}
        <button class="logout-btn-header" onclick={handleLogout} aria-label="Sign Out" title="Sign Out">
          <span class="logout-icon">↩</span> Sign Out
        </button>
      </div>
    {:else}
      <button class="google-btn-header" onclick={handleLogin} disabled={signingIn}>
        {#if signingIn}
          <div class="spinner"></div>
        {:else}
          <svg class="google-icon" viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        {/if}
        Sign In
      </button>
    {/if}
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
    gap: 12px;
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

  /* Header user profile styles */
  .user-profile-group {
    display: flex;
    align-items: center;
    gap: 8px;
    border-left: 1px solid var(--border);
    padding-left: 12px;
  }

  .user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--border);
    flex-shrink: 0;
  }

  .user-avatar.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--gold-dim) 0%, rgba(196, 160, 87, 0.3) 100%);
    color: var(--gold-light);
    font-size: 10px;
    font-weight: 600;
  }

  .logout-btn-header {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 8px;
    color: var(--text-secondary);
    font-size: 11px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .logout-btn-header:hover {
    border-color: var(--danger-light);
    color: var(--danger-light);
    background: rgba(160, 80, 80, 0.05);
  }

  .logout-icon {
    font-size: 11px;
  }

  .google-btn-header {
    background: var(--gold);
    color: #1a1208;
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease-out;
  }

  .google-btn-header:hover:not(:disabled) {
    background: var(--gold-light);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(196, 160, 87, 0.15);
  }

  .google-btn-header:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .google-icon {
    flex-shrink: 0;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(26, 18, 8, 0.2);
    border-top-color: #1a1208;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
