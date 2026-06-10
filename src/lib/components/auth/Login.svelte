<script lang="ts">
  import { signInWithGoogle } from '$lib/userStore.js';

  let loading = $state(false);
  let errorMessage = $state('');

  async function handleLogin() {
    loading = true;
    errorMessage = '';
    try {
      await signInWithGoogle();
      // Google OAuth redirects away, but setting loading keeps state responsive
    } catch (err: any) {
      loading = false;
      errorMessage = err.message || 'An unexpected error occurred during Google sign-in.';
    }
  }
</script>

<div class="login-wrapper">
  <div class="login-card">
    <div class="brand">
      <div class="logo">♛ ChessMind</div>
      <div class="tagline">Cognitive Chess Platform</div>
    </div>

    <div class="divider"></div>

    <div class="content">
      <h2>Welcome to the Arena</h2>
      <p>Challenge the advanced neural chess AI, analyze your games in the cognitive lab, and track your progress.</p>
    </div>

    {#if errorMessage}
      <div class="error-banner">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{errorMessage}</span>
      </div>
    {/if}

    <button class="google-btn" onclick={handleLogin} disabled={loading}>
      {#if loading}
        <div class="spinner"></div>
        Connecting to Google...
      {:else}
        <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      {/if}
    </button>

    <div class="footer">
      Secured by Supabase Auth & Google SSL
    </div>
  </div>
</div>

<style>
  .login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: radial-gradient(circle at center, var(--bg-card) 0%, var(--bg-void) 100%);
    padding: 24px;
    width: 100%;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background: var(--bg-deep);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 40px 32px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.02);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .brand {
    margin-bottom: 24px;
  }

  .logo {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    color: var(--gold);
    letter-spacing: 1px;
    line-height: 1.2;
  }

  .tagline {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-top: 6px;
    font-weight: 600;
  }

  .divider {
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin-bottom: 32px;
  }

  .content {
    margin-bottom: 32px;
  }

  .content h2 {
    font-size: 20px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 12px;
    letter-spacing: 0.5px;
  }

  .content p {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    background: rgba(160, 80, 80, 0.1);
    border: 1px solid var(--danger);
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    text-align: left;
  }

  .error-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .error-text {
    font-size: 13px;
    color: var(--danger-light);
    line-height: 1.4;
  }

  .google-btn {
    width: 100%;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
  }

  .google-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--border-glow);
    box-shadow: 0 4px 12px rgba(196, 160, 87, 0.08);
    transform: translateY(-1px);
  }

  .google-btn:active:not(:disabled) {
    background: var(--bg-active);
    transform: translateY(0);
  }

  .google-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .google-icon {
    flex-shrink: 0;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .footer {
    margin-top: 32px;
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.5px;
  }
</style>
