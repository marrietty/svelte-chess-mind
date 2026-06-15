<script lang="ts">
  import { signInWithGoogle } from '$lib/userStore.js';

  let { onclose }: {
    onclose?: () => void;
  } = $props();

  let dontShowAgain = $state(false);
  let loading = $state(false);
  let errorMessage = $state('');

  async function handleSignUp() {
    loading = true;
    errorMessage = '';
    try {
      await signInWithGoogle();
    } catch (err: any) {
      loading = false;
      errorMessage = err.message || 'An unexpected error occurred during Google sign-in.';
    }
  }

  function handleMaybeLater() {
    if (dontShowAgain) {
      localStorage.setItem('hide_auth_popup', 'true');
    }
    if (onclose) {
      onclose();
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="auth-overlay" onclick={handleMaybeLater}>
  <div class="auth-modal" onclick={(e) => e.stopPropagation()}>
    <!-- Close button -->
    <button class="close-btn" onclick={handleMaybeLater} aria-label="Close modal">×</button>

    <div class="auth-icon">👑</div>
    
    <h2 class="auth-title">Want to save your progress?</h2>
    
    <p class="auth-copy">
      Connect your Google account to track your scores, unlock achievements, and climb the civic leaderboard.
    </p>

    {#if errorMessage}
      <div class="error-banner">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{errorMessage}</span>
      </div>
    {/if}

    <div class="auth-actions">
      <!-- High prominent CTA -->
      <button class="btn-signup-google" onclick={handleSignUp} disabled={loading}>
        {#if loading}
          <div class="spinner"></div>
          Connecting...
        {:else}
          <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign Up with Google
        {/if}
      </button>

      <!-- Secondary low contrast CTA -->
      <button class="btn-maybe-later" onclick={handleMaybeLater}>
        Maybe Later
      </button>
    </div>

    <!-- Never Show Again Checkbox -->
    <div class="auth-footer">
      <label class="checkbox-container">
        <input type="checkbox" bind:checked={dontShowAgain} />
        <span class="checkmark"></span>
        Don't show this message again
      </label>
    </div>
  </div>
</div>

<style>
  .auth-overlay {
    position: fixed;
    inset: 0;
    background: rgba(4, 5, 8, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 1100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.25s ease-out;
  }

  .auth-modal {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 16px;
    padding: 40px 32px 32px;
    text-align: center;
    max-width: 400px;
    width: 100%;
    position: relative;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03);
    animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 20px;
    background: transparent;
    border: none;
    font-size: 24px;
    color: var(--text-muted);
    cursor: pointer;
    line-height: 1;
    transition: color 0.15s;
  }

  .close-btn:hover {
    color: var(--text-primary);
  }

  .auth-icon {
    font-size: 52px;
    margin-bottom: 20px;
    filter: drop-shadow(0 4px 10px rgba(196, 160, 87, 0.25));
    animation: floatIcon 3s ease-in-out infinite;
  }

  .auth-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--gold-light);
    margin-bottom: 12px;
    line-height: 1.25;
  }

  .auth-copy {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 28px;
    padding: 0 10px;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(160, 80, 80, 0.08);
    border: 1px solid var(--danger);
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: left;
  }

  .error-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .error-text {
    font-size: 12px;
    color: var(--danger-light);
    line-height: 1.4;
  }

  .auth-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
    width: 100%;
  }

  .btn-signup-google {
    width: 100%;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: var(--gold);
    color: #1a1208;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 14px rgba(196, 160, 87, 0.2);
  }

  .btn-signup-google:hover:not(:disabled) {
    background: var(--gold-light);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(196, 160, 87, 0.3);
  }

  .btn-signup-google:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-signup-google:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-maybe-later {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s, background-color 0.15s;
    border-radius: 8px;
  }

  .btn-maybe-later:hover {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.02);
  }

  .google-icon {
    flex-shrink: 0;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(26, 18, 8, 0.15);
    border-top-color: #1a1208;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Checkbox styling */
  .auth-footer {
    border-top: 1px solid var(--border);
    padding-top: 20px;
    display: flex;
    justify-content: center;
  }

  .checkbox-container {
    display: inline-flex;
    align-items: center;
    position: relative;
    padding-left: 26px;
    cursor: pointer;
    font-size: 12px;
    color: var(--text-muted);
    user-select: none;
    line-height: 1;
    transition: color 0.15s;
  }

  .checkbox-container:hover {
    color: var(--text-secondary);
  }

  .checkbox-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: -2px;
    left: 0;
    height: 16px;
    width: 16px;
    background-color: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 4px;
    transition: all 0.2s;
  }

  .checkbox-container:hover input ~ .checkmark {
    border-color: var(--gold-dim);
  }

  .checkbox-container input:checked ~ .checkmark {
    background-color: var(--gold);
    border-color: var(--gold);
  }

  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  .checkbox-container input:checked ~ .checkmark:after {
    display: block;
  }

  .checkbox-container .checkmark:after {
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid #1a1208;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes floatIcon {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
