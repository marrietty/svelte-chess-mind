<script lang="ts">
  import { signInWithGoogle, userStore } from '$lib/userStore.js';

  let loading = $state(false);
  let errorMessage = $state('');

  // High-fidelity progress mock data for authenticated state
  const stats = {
    streak: 5,
    elo: 1540,
    matches: {
      wins: 24,
      losses: 12,
      draws: 4,
    },
    achievements: [
      { id: 'first-win', title: 'First Win', description: 'Defeated your first AI opponent.', icon: '🏆', unlocked: true, date: 'June 10, 2026' },
      { id: 'streak-master', title: 'Streak Master', description: 'Reached a 5-day play streak.', icon: '🔥', unlocked: true, date: 'June 18, 2026' },
      { id: 'ai-conqueror', title: 'AI Conqueror', description: 'Defeated the AI on Medium difficulty.', icon: '🤖', unlocked: true, date: 'June 14, 2026' },
      { id: 'puzzle-solver', title: 'Puzzle Solver', description: 'Solved 20 tactical puzzles.', icon: '🧩', unlocked: true, date: 'June 12, 2026' },
      { id: 'grandmaster', title: 'Grandmaster', description: 'Reach a rating of 2000 Elo.', icon: '👑', unlocked: false },
      { id: 'clean-sweep', title: 'Clean Sweep', description: 'Win a match without losing any major pieces.', icon: '⚔️', unlocked: false }
    ]
  };

  async function handleLogin() {
    loading = true;
    errorMessage = '';
    try {
      await signInWithGoogle();
    } catch (err: any) {
      loading = false;
      errorMessage = err.message || 'An unexpected error occurred during Google sign-in.';
    }
  }

  // Derived properties for match stats
  const totalGames = $derived(stats.matches.wins + stats.matches.losses + stats.matches.draws);
  const winRate = $derived(totalGames > 0 ? Math.round((stats.matches.wins / totalGames) * 100) : 0);
  
  // Percentages for stats bar visualizer
  const winPct = $derived(totalGames > 0 ? (stats.matches.wins / totalGames) * 100 : 0);
  const lossPct = $derived(totalGames > 0 ? (stats.matches.losses / totalGames) * 100 : 0);
  const drawPct = $derived(totalGames > 0 ? (stats.matches.draws / totalGames) * 100 : 0);

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

<div class="progress-view-wrapper">
  {#if !$userStore}
    <!-- STATE A: GUEST (NOT LOGGED IN) -->
    <div class="guest-container">
      <div class="guest-card">
        <div class="badge-icon">🏆</div>
        <h2 class="guest-title">Track Your Chess Journey!</h2>
        <p class="guest-desc">
          Sign in to unlock permanent progress tracking, daily streak counters, and performance analytics. Take your game to the next level.
        </p>

        {#if errorMessage}
          <div class="error-banner">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{errorMessage}</span>
          </div>
        {/if}

        <button class="btn-signup-google" onclick={handleLogin} disabled={loading}>
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
            Sign in with Google
          {/if}
        </button>
      </div>
    </div>
  {:else}
    <!-- STATE B: LOGGED IN USER -->
    <div class="user-dashboard animate-fade-in">
      <div class="profile-header">
        {#if $userStore.avatarUrl}
          <img class="avatar" src={$userStore.avatarUrl} alt={$userStore.name} referrerpolicy="no-referrer" />
        {:else}
          <div class="avatar-fallback">{getInitials($userStore.name)}</div>
        {/if}
        <div>
          <h1 class="welcome-text">Welcome back, <span class="highlight">{$userStore.name}</span></h1>
          <p class="subtitle">ChessMind Account Profile & Ratings</p>
        </div>
      </div>

      <!-- Performance metrics row -->
      <div class="metrics-grid">
        <!-- Daily Streak Card -->
        <div class="metric-card streak">
          <div class="card-icon flame-active">🔥</div>
          <div class="card-content">
            <span class="card-label">Daily Streak</span>
            <span class="card-value">{stats.streak} Days</span>
            <span class="card-hint">Keep playing daily!</span>
          </div>
        </div>

        <!-- Puzzle ELO Card -->
        <div class="metric-card rating">
          <div class="card-icon brain-icon">🧠</div>
          <div class="card-content">
            <span class="card-label">Puzzle Rating</span>
            <span class="card-value">{stats.elo} Elo</span>
            <span class="card-hint">Top 15% of players</span>
          </div>
        </div>

        <!-- Win/Loss Record Card -->
        <div class="metric-card record">
          <div class="card-icon crown-icon">👑</div>
          <div class="card-content w-100">
            <div class="d-flex justify-between">
              <span class="card-label">Record</span>
              <span class="card-value winrate">{winRate}% Win Rate</span>
            </div>
            
            <!-- SEGMENTED PROGRESS BAR -->
            <div class="progress-track">
              <div class="segment win" style="width: {winPct}%" title="Wins: {stats.matches.wins}"></div>
              <div class="segment draw" style="width: {drawPct}%" title="Draws: {stats.matches.draws}"></div>
              <div class="segment loss" style="width: {lossPct}%" title="Losses: {stats.matches.losses}"></div>
            </div>

            <div class="stats-counts">
              <span class="stat-cnt win-color">{stats.matches.wins}W</span>
              <span class="stat-cnt draw-color">{stats.matches.draws}D</span>
              <span class="stat-cnt loss-color">{stats.matches.losses}L</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements Section -->
      <div class="section-title">Achievements & Badges</div>
      
      <div class="badges-grid">
        {#each stats.achievements as badge}
          <div class="badge-card" class:locked={!badge.unlocked}>
            <div class="badge-avatar-wrap">
              <span class="badge-emoji">{badge.icon}</span>
              {#if !badge.unlocked}
                <div class="lock-indicator">🔒</div>
              {/if}
            </div>
            <div class="badge-info">
              <div class="badge-title">{badge.title}</div>
              <div class="badge-description">{badge.description}</div>
              {#if badge.unlocked && badge.date}
                <div class="badge-unlocked-date">Unlocked {badge.date}</div>
              {:else}
                <div class="badge-unlocked-date locked-text">Locked</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .progress-view-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 0;
  }

  /* ── STATE A: GUEST ───────────────────────────────────────────────────────── */
  .guest-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    width: 100%;
  }

  .guest-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 50px 40px;
    text-align: center;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.02);
    position: relative;
    overflow: hidden;
  }

  .guest-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(196, 160, 87, 0.03) 0%, transparent 70%);
    pointer-events: none;
  }

  .badge-icon {
    font-size: 64px;
    margin-bottom: 24px;
    filter: drop-shadow(0 8px 16px rgba(196, 160, 87, 0.2));
    animation: float 4s ease-in-out infinite;
  }

  .guest-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--gold-light);
    margin-bottom: 16px;
  }

  .guest-desc {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.65;
    margin-bottom: 36px;
  }

  .btn-signup-google {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    max-width: 280px;
    height: 48px;
    background: var(--gold);
    color: #1a1208;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 14px rgba(196, 160, 87, 0.2);
  }

  .btn-signup-google:hover:not(:disabled) {
    background: var(--gold-light);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(196, 160, 87, 0.35);
  }

  .btn-signup-google:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-signup-google:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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

  .error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(160, 80, 80, 0.08);
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

  /* ── STATE B: LOGGED IN USER ──────────────────────────────────────────────── */
  .user-dashboard {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    padding: 24px 28px;
    border-radius: 16px;
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--gold);
    box-shadow: 0 0 12px rgba(196, 160, 87, 0.2);
  }

  .avatar-fallback {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--blue-accent), #6a5acd);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 600;
    color: white;
    border: 2px solid var(--gold);
    box-shadow: 0 0 12px rgba(196, 160, 87, 0.2);
  }

  .welcome-text {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--cream);
  }

  .welcome-text .highlight {
    color: var(--gold-light);
  }

  .subtitle {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  /* Metrics grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }

  .metric-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: transform 0.2s, border-color 0.2s;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    border-color: var(--border-glow);
  }

  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    background: var(--bg-panel);
    flex-shrink: 0;
  }

  .flame-active {
    background: rgba(224, 112, 112, 0.1);
    animation: flamePulse 2s ease-in-out infinite alternate;
  }

  .brain-icon {
    background: rgba(106, 163, 208, 0.1);
  }

  .crown-icon {
    background: rgba(196, 160, 87, 0.1);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .card-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-muted);
    font-weight: 500;
  }

  .card-value {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--gold-light);
    margin: 4px 0 2px;
  }

  .card-hint {
    font-size: 12px;
    color: var(--text-secondary);
  }

  /* Segmented progress track */
  .w-100 {
    width: 100%;
  }

  .d-flex {
    display: flex;
  }

  .justify-between {
    justify-content: space-between;
  }

  .winrate {
    font-size: 13px !important;
    margin: 0 !important;
    align-self: center;
  }

  .progress-track {
    height: 8px;
    background: var(--bg-panel);
    border-radius: 4px;
    display: flex;
    overflow: hidden;
    margin: 10px 0 8px;
    border: 1px solid var(--border);
  }

  .segment {
    height: 100%;
    transition: width 0.3s ease;
  }

  .segment.win {
    background: var(--success);
  }

  .segment.draw {
    background: var(--text-muted);
  }

  .segment.loss {
    background: var(--danger);
  }

  .stats-counts {
    display: flex;
    gap: 12px;
    font-size: 12px;
  }

  .stat-cnt {
    font-weight: 500;
  }

  .win-color {
    color: #6bcf96;
  }

  .draw-color {
    color: var(--text-secondary);
  }

  .loss-color {
    color: var(--danger-light);
  }

  /* Achievements */
  .section-title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--text-muted);
    font-weight: 600;
    margin-top: 10px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 12px;
  }

  .badges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .badge-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    gap: 16px;
    align-items: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .badge-card:hover:not(.locked) {
    border-color: var(--border-glow);
    background: var(--bg-panel);
    transform: scale(1.02);
    box-shadow: 0 8px 20px rgba(196, 160, 87, 0.05);
  }

  .badge-avatar-wrap {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--bg-panel);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border: 1px solid var(--border);
    flex-shrink: 0;
  }

  .badge-emoji {
    font-size: 32px;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
  }

  .lock-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: #232a3e;
    border: 1px solid var(--border);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }

  .badge-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .badge-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--cream);
  }

  .badge-description {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
    line-height: 1.4;
  }

  .badge-unlocked-date {
    font-size: 10px;
    color: var(--gold-light);
    margin-top: 6px;
    font-weight: 500;
  }

  /* Locked styles */
  .badge-card.locked {
    opacity: 0.45;
  }

  .badge-card.locked .badge-avatar-wrap {
    background: #0f1219;
  }

  .badge-card.locked .badge-emoji {
    filter: grayscale(1);
  }

  .locked-text {
    color: var(--text-muted);
  }

  /* Helper utilities */
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }

  /* Animations */
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes flamePulse {
    0% {
      background: rgba(224, 112, 112, 0.08);
      box-shadow: 0 0 0 0 rgba(224, 112, 112, 0);
    }
    100% {
      background: rgba(224, 112, 112, 0.18);
      box-shadow: 0 0 10px 2px rgba(224, 112, 112, 0.15);
    }
  }

  @media (max-width: 768px) {
    .metrics-grid {
      grid-template-columns: 1fr;
    }
    
    .guest-card {
      padding: 30px 20px;
    }
  }
</style>
