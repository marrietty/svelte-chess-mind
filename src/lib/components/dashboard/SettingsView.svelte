<script lang="ts">
  import { onMount } from 'svelte';
  import { signInWithGoogle, signOut, userStore } from '$lib/userStore.js';
  
  // Theme and board preferences from stores
  import { boardThemeStore, setBoardTheme } from '$lib/stores/theme';
  import { showHints } from '$lib/stores/aiGame';

  // Sound effects state
  let soundEffects = $state(true);
  let resetting = $state(false);
  let resetSuccess = $state(false);
  let loginLoading = $state(false);

  // Initialize settings from localStorage on mount
  onMount(() => {
    const savedSound = localStorage.getItem('chessmind-sound-effects');
    soundEffects = savedSound !== 'false'; // Defaults to true
  });

  // Keep sound effects persisted on change
  $effect(() => {
    localStorage.setItem('chessmind-sound-effects', String(soundEffects));
  });

  async function handleLinkGoogle() {
    loginLoading = true;
    try {
      await signInWithGoogle();
    } catch (err) {
      loginLoading = false;
      console.error(err);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
    } catch (err) {
      console.error(err);
    }
  }

  function handleResetSettings() {
    resetting = true;
    setTimeout(() => {
      // Clear key storage items
      localStorage.removeItem('chessmind-sound-effects');
      localStorage.removeItem('chessmind-board-theme');
      localStorage.removeItem('chessmind-show-hints');
      localStorage.removeItem('chessmind-theme');

      // Reset Svelte stores
      setBoardTheme('wood');
      showHints.set(true);
      soundEffects = true;

      resetting = false;
      resetSuccess = true;

      setTimeout(() => {
        resetSuccess = false;
      }, 3000);
    }, 8000);
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
</script>

<div class="settings-view-wrapper animate-fade-in">
  <div class="settings-container">
    
    <!-- ── SECTION 1: ACCOUNT PROFILE ───────────────────────────────────────── -->
    <div class="settings-section">
      <h2 class="section-title">Account Profile</h2>
      <div class="section-card account-card">
        {#if $userStore}
          <div class="account-profile">
            {#if $userStore.avatarUrl}
              <img class="avatar" src={$userStore.avatarUrl} alt={$userStore.name} referrerpolicy="no-referrer" />
            {:else}
              <div class="avatar-fallback">{getInitials($userStore.name)}</div>
            {/if}
            <div class="account-details">
              <div class="profile-name">{$userStore.name}</div>
              <div class="profile-email">{$userStore.email}</div>
              <span class="badge-online">● Connected via Google</span>
            </div>
            <button class="btn-logout" onclick={handleLogout}>
              ↩ Log Out
            </button>
          </div>
        {:else}
          <div class="account-profile guest">
            <div class="avatar-fallback guest-icon">👤</div>
            <div class="account-details">
              <div class="profile-name">Guest Account</div>
              <div class="profile-email text-muted">You are playing as a Guest</div>
              <p class="guest-info-text">Your match logs and local progress are saved to your current browser cache only.</p>
            </div>
            <button class="btn-link-google" onclick={handleLinkGoogle} disabled={loginLoading}>
              {#if loginLoading}
                <div class="spinner"></div>
                Linking...
              {:else}
                <svg class="google-icon" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Link Google Account
              {/if}
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- ── SECTION 2: GAME PREFERENCES ──────────────────────────────────────── -->
    <div class="settings-section">
      <h2 class="section-title">Game Preferences</h2>
      <div class="section-card preferences-card">
        
        <!-- Toggle: Sound Effects -->
        <div class="preference-row">
          <div class="pref-info">
            <span class="pref-label">Board Sound Effects</span>
            <span class="pref-desc">Play moves, check alerts, and capture sound effects.</span>
          </div>
          <button class="toggle-switch" class:active={soundEffects} onclick={() => soundEffects = !soundEffects}>
            <span class="toggle-knob"></span>
          </button>
        </div>

        <!-- Toggle: Show Move Hints -->
        <div class="preference-row">
          <div class="pref-info">
            <span class="pref-label">Show Move Hints</span>
            <span class="pref-desc">Highlight legal moves and warnings when selecting pieces.</span>
          </div>
          <button class="toggle-switch" class:active={$showHints} onclick={() => showHints.set(!$showHints)}>
            <span class="toggle-knob"></span>
          </button>
        </div>

        <!-- Selection: Board Theme -->
        <div class="preference-row theme-selector-row">
          <div class="pref-info">
            <span class="pref-label">Chessboard Theme</span>
            <span class="pref-desc">Choose your preferred wood texture or solid board style.</span>
          </div>
          <div class="theme-options">
            <button 
              class="theme-opt-btn wood" 
              class:active={$boardThemeStore === 'wood'}
              onclick={() => setBoardTheme('wood')}
              title="Classic Wood"
            >
              <div class="theme-preview wood-preview"></div>
              <span>Classic Wood</span>
            </button>
            <button 
              class="theme-opt-btn blue" 
              class:active={$boardThemeStore === 'blue'}
              onclick={() => setBoardTheme('blue')}
              title="Dark Mode Blue"
            >
              <div class="theme-preview blue-preview"></div>
              <span>Dark Blue</span>
            </button>
            <button 
              class="theme-opt-btn forest" 
              class:active={$boardThemeStore === 'forest'}
              onclick={() => setBoardTheme('forest')}
              title="Emerald Green"
            >
              <div class="theme-preview forest-preview"></div>
              <span>Emerald</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ── SECTION 3: APP SUPPORT / INFO ────────────────────────────────────── -->
    <div class="settings-section">
      <h2 class="section-title">Support & System</h2>
      <div class="section-card support-card">
        <div class="preference-row align-start">
          <div class="pref-info">
            <span class="pref-label">Clear Cache & Reset Settings</span>
            <span class="pref-desc">Resets all chessboard preferences, streaks, and sound settings back to default. This cannot be undone.</span>
          </div>
          <div class="reset-actions">
            <button class="btn-danger-outline" onclick={handleResetSettings} disabled={resetting}>
              {#if resetting}
                <div class="spinner border-danger"></div>
                Resetting...
              {:else}
                Reset Settings
              {/if}
            </button>
            {#if resetSuccess}
              <div class="reset-success-alert">✓ System reset successfully!</div>
            {/if}
          </div>
        </div>

        <div class="app-info-footer">
          <div class="version-label">ChessMind Engine — v1.0.0</div>
          <div class="footer-links">
            <a href="#privacy" onclick={(e) => e.preventDefault()}>Privacy Policy</a>
            <span>•</span>
            <a href="#terms" onclick={(e) => e.preventDefault()}>Terms of Service</a>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>

<style>
  .settings-view-wrapper {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 10px 0 40px;
  }

  .settings-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--text-muted);
    font-weight: 600;
    padding-left: 4px;
  }

  .section-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px 28px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  /* Account Card */
  .account-profile {
    display: flex;
    align-items: center;
    gap: 20px;
    width: 100%;
  }

  .account-profile.guest {
    align-items: flex-start;
  }

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--gold);
    box-shadow: 0 0 12px rgba(196, 160, 87, 0.2);
  }

  .avatar-fallback {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--bg-panel);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 600;
    color: var(--gold-light);
    border: 2px solid var(--border);
  }

  .avatar-fallback.guest-icon {
    font-size: 28px;
    background: var(--bg-void);
    color: var(--text-muted);
  }

  .account-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .profile-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--cream);
  }

  .profile-email {
    font-size: 13.5px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .badge-online {
    display: inline-block;
    align-self: flex-start;
    font-size: 10px;
    color: var(--success);
    background: rgba(74, 144, 104, 0.08);
    border: 1px solid rgba(74, 144, 104, 0.2);
    padding: 2px 8px;
    border-radius: 20px;
    margin-top: 8px;
    font-weight: 500;
  }

  .guest-info-text {
    font-size: 12.5px;
    color: var(--text-muted);
    margin-top: 6px;
    line-height: 1.4;
    max-width: 440px;
  }

  .btn-logout {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 12.5px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-logout:hover {
    border-color: var(--danger);
    color: var(--danger-light);
    background: rgba(160, 80, 80, 0.04);
  }

  .btn-link-google {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 20px;
    background: var(--gold);
    color: #1a1208;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 4px 12px rgba(196, 160, 87, 0.15);
    align-self: center;
  }

  .btn-link-google:hover:not(:disabled) {
    background: var(--gold-light);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(196, 160, 87, 0.25);
  }

  .btn-link-google:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* Preferences section */
  .preferences-card {
    display: flex;
    flex-direction: column;
  }

  .preference-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
    border-bottom: 1px solid var(--border);
    gap: 24px;
  }

  .preference-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .preference-row:first-child {
    padding-top: 0;
  }

  .theme-selector-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .pref-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pref-label {
    font-size: 14.5px;
    font-weight: 600;
    color: var(--cream);
  }

  .pref-desc {
    font-size: 12.5px;
    color: var(--text-secondary);
    line-height: 1.4;
    max-width: 500px;
  }

  /* Toggle Switch */
  .toggle-switch {
    width: 48px;
    height: 26px;
    border-radius: 13px;
    background: var(--bg-panel);
    border: 1px solid var(--border);
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
    flex-shrink: 0;
  }

  .toggle-switch.active {
    background: var(--gold);
    border-color: var(--gold);
  }

  .toggle-knob {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--text-primary);
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  }

  .toggle-switch.active .toggle-knob {
    transform: translateX(22px);
    background: #1a1208;
  }

  /* Themes selector */
  .theme-options {
    display: flex;
    gap: 16px;
    width: 100%;
    flex-wrap: wrap;
    margin-top: 4px;
  }

  .theme-opt-btn {
    flex: 1;
    min-width: 140px;
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    color: var(--text-secondary);
    font-size: 12.5px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .theme-opt-btn:hover {
    border-color: var(--border-glow);
    color: var(--text-primary);
  }

  .theme-opt-btn.active {
    border-color: var(--gold);
    color: var(--gold-light);
    background: var(--gold-dim);
  }

  .theme-preview {
    width: 100%;
    height: 48px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .wood-preview {
    background: linear-gradient(135deg, #e8d5b0 50%, #8b6344 50%);
  }

  .blue-preview {
    background: linear-gradient(135deg, #dee3e6 50%, #3b698e 50%);
  }

  .forest-preview {
    background: linear-gradient(135deg, #ececd7 50%, #739552 50%);
  }

  /* Support / Danger Reset Area */
  .align-start {
    align-items: flex-start;
  }

  .reset-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    flex-shrink: 0;
  }

  .btn-danger-outline {
    padding: 10px 18px;
    background: transparent;
    border: 1px solid var(--danger);
    color: var(--danger-light);
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-danger-outline:hover:not(:disabled) {
    background: rgba(160, 80, 80, 0.08);
  }

  .btn-danger-outline:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .reset-success-alert {
    font-size: 12px;
    color: var(--success);
    font-weight: 500;
  }

  /* App Support Footer */
  .app-info-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border);
    padding-top: 20px;
    margin-top: 12px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .footer-links {
    display: flex;
    gap: 8px;
  }

  .footer-links a {
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.15s;
  }

  .footer-links a:hover {
    color: var(--gold-light);
  }

  /* Utilities */
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .spinner.border-danger {
    border-color: rgba(224, 112, 112, 0.15);
    border-top-color: var(--danger);
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 600px) {
    .account-profile {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .account-profile.guest {
      align-items: center;
    }
    
    .account-profile .btn-logout,
    .account-profile .btn-link-google {
      width: 100%;
      margin-top: 12px;
    }
    
    .preference-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .preference-row .toggle-switch,
    .reset-actions {
      align-self: flex-end;
    }
  }
</style>
