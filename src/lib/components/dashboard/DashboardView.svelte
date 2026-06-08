<script lang="ts">
  import type { ViewId } from '$lib/types';

  let { onnavigate }: {
    onnavigate?: (e: CustomEvent<{ viewId: ViewId }>) => void;
  } = $props();

  function selectView(viewId: ViewId) {
    if (onnavigate) {
      onnavigate(new CustomEvent('navigate', { detail: { viewId } }));
    }
  }
</script>

<div class="dashboard-view">
  <div class="hero-banner">
    <div class="hero-eyebrow">Where AI meets the ancient game</div>
    <h1 class="hero-h1">Play. Learn. <em>Master Chess</em> — with an intelligent AI companion.</h1>
    <p class="hero-sub">An adaptive platform designed to lower the steep learning curve for beginners while keeping intermediate players strategically engaged, session after session.</p>
    <div class="hero-ctas">
      <button class="btn-primary" onclick={() => selectView('ai-play')}>🤖 Play vs AI</button>
      <button class="btn-ghost" onclick={() => selectView('pvp')}>⚔ Local Match</button>
      <button class="btn-ghost" onclick={() => selectView('learn')}>📖 Study Mode</button>
    </div>
  </div>

  <div class="metrics-row">
    <div class="metric-card">
      <div class="metric-icon">🌎</div>
      <div>
        <div class="metric-val">600M+</div>
        <div class="metric-label">Chess players worldwide</div>
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-icon">🧠</div>
      <div>
        <div class="metric-val">30%</div>
        <div class="metric-label">Boost in critical thinking skills</div>
      </div>
    </div>
    <div class="metric-card">
      <div class="metric-icon">⏳</div>
      <div>
        <div class="metric-val">1500+</div>
        <div class="metric-label">Years of proven cognitive value</div>
      </div>
    </div>
  </div>

  <div class="section-heading">Core Features</div>
  <div class="pillars-grid">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="pillar-card" onclick={() => selectView('ai-play')}>
      <div class="pillar-icon-wrap gold">🤖</div>
      <div class="pillar-title">AI Opponent</div>
      <div class="pillar-desc">Challenge an adaptive AI engine that matches your level. Grow from beginner to competitive through smart difficulty scaling.</div>
      <div class="pillar-diff-tags">
        <span class="diff-tag easy">Easy</span>
        <span class="diff-tag med">Medium</span>
        <span class="diff-tag int">Intermediate</span>
        <span class="diff-tag hard">Hard</span>
      </div>
      <div class="pillar-arrow">→</div>
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="pillar-card" onclick={() => selectView('pvp')}>
      <div class="pillar-icon-wrap blue">⚔</div>
      <div class="pillar-title">Player vs Player</div>
      <div class="pillar-desc">Face a friend in a local two-player match on the same device. Track wins across your session and settle who reigns supreme.</div>
      <div class="pillar-diff-tags">
        <span class="diff-tag med">Local Match</span>
        <span class="diff-tag int">Win Tracking</span>
      </div>
      <div class="pillar-arrow">→</div>
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="pillar-card" onclick={() => selectView('learn')}>
      <div class="pillar-icon-wrap teal">📖</div>
      <div class="pillar-title">Learning Hub</div>
      <div class="pillar-desc">Your dedicated study library. Piece guides, opening theory, rules explained simply, and beginner tactical puzzles.</div>
      <div class="pillar-diff-tags">
        <span class="diff-tag easy">Piece Guide</span>
        <span class="diff-tag med">Openings</span>
        <span class="diff-tag int">Puzzles</span>
      </div>
      <div class="pillar-arrow">→</div>
    </div>
  </div>

  <div class="section-heading">How ChessMind Works</div>
  <div class="how-it-works-grid">
    <div class="panel-card step-card">
      <div class="step-num">1💡</div>
      <div class="step-title">Choose Your Mode</div>
      <div class="step-desc">AI Practice, Local PvP, or dive into the Learning Hub</div>
    </div>
    <div class="panel-card step-card">
      <div class="step-num">2⚙</div>
      <div class="step-title">Set Difficulty</div>
      <div class="step-desc">Pick Easy through Hard — the AI adapts its strategy accordingly</div>
    </div>
    <div class="panel-card step-card">
      <div class="step-num">3🎓</div>
      <div class="step-title">Play & Learn</div>
      <div class="step-desc">Get real-time hints, see legal moves, and understand each position</div>
    </div>
    <div class="panel-card step-card">
      <div class="step-num">4📈</div>
      <div class="step-title">Track Progress</div>
      <div class="step-desc">Review game history, win streaks, and improve over time</div>
    </div>
  </div>
</div>

<style>
  .dashboard-view {
    display: flex;
    flex-direction: column;
  }

  .hero-banner {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 44px 40px;
    position: relative;
    overflow: hidden;
    margin-bottom: 28px;
  }

  .hero-banner::before {
    content: '👑';
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 140px;
    color: rgba(196, 160, 87, 0.07);
    line-height: 1;
    pointer-events: none;
  }

  .hero-eyebrow {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: var(--gold);
    font-weight: 500;
    margin-bottom: 12px;
  }

  .hero-h1 {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    max-width: 520px;
    color: var(--cream);
  }

  .hero-h1 em {
    font-style: italic;
    color: var(--gold-light);
  }

  .hero-sub {
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 440px;
    margin-top: 14px;
    line-height: 1.65;
  }

  .hero-ctas {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
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

  .metrics-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }

  .metric-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 22px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .metric-icon {
    font-size: 24px;
    margin-top: 2px;
    line-height: 1;
  }

  .metric-val {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: var(--gold-light);
    line-height: 1;
  }

  .metric-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
    line-height: 1.4;
  }

  .section-heading {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--text-muted);
    font-weight: 500;
    margin-bottom: 14px;
  }

  .pillars-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }

  .pillar-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 22px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .pillar-card:hover {
    border-color: var(--border-glow);
    background: var(--bg-panel);
    transform: translateY(-2px);
  }

  .pillar-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 14px;
    line-height: 1;
  }

  .pillar-icon-wrap.gold {
    background: var(--gold-dim);
  }

  .pillar-icon-wrap.blue {
    background: rgba(74, 127, 165, 0.15);
  }

  .pillar-icon-wrap.teal {
    background: rgba(74, 170, 130, 0.12);
  }

  .pillar-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--cream);
  }

  .pillar-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.55;
  }

  .pillar-diff-tags {
    display: flex;
    gap: 5px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .diff-tag {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
  }

  .diff-tag.easy {
    background: rgba(74, 144, 104, 0.2);
    color: #6bcf96;
  }

  .diff-tag.med {
    background: rgba(74, 127, 165, 0.2);
    color: #6aa3d0;
  }

  .diff-tag.int {
    background: rgba(196, 160, 87, 0.2);
    color: var(--gold);
  }

  .diff-tag.hard {
    background: rgba(180, 80, 80, 0.2);
    color: #e07070;
  }

  .pillar-arrow {
    position: absolute;
    bottom: 18px;
    right: 18px;
    font-size: 16px;
    color: var(--text-muted);
    transition: all 0.2s;
  }

  .pillar-card:hover .pillar-arrow {
    color: var(--gold);
    transform: translateX(3px);
  }

  .how-it-works-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .panel-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 18px;
  }

  .step-card {
    text-align: center;
  }

  .step-num {
    font-size: 28px;
    margin-bottom: 10px;
    line-height: 1;
  }

  .step-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 6px;
  }

  .step-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
  }
</style>
