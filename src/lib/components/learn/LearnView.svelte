<script lang="ts">
  import { SCENARIOS, SCENARIO_ORDER } from '$lib/chess/scenarios';
  import MiniBoard from './MiniBoard.svelte';
  import type { ScenarioId } from '$lib/types';

  let { onloadScenario }: {
    onloadScenario?: (e: CustomEvent<{ scenarioId: ScenarioId }>) => void;
  } = $props();

  let activeTab = $state<'pieces' | 'openings' | 'rules' | 'scenarios'>('pieces');

  const piecesData = [
    {
      symbol: '♚',
      name: 'King',
      badgeClass: 'king',
      valueLabel: 'Invaluable',
      moveDescription: 'Moves one square in any direction — horizontally, vertically, or diagonally. Cannot move into check. The most important piece on the board.',
      strategyTip: 'Strategy: Keep the king safe — always prioritize castling early in the game.'
    },
    {
      symbol: '♛',
      name: 'Queen',
      badgeClass: 'queen',
      valueLabel: '9 points',
      moveDescription: 'The most powerful piece. Moves any number of squares in any direction (horizontal, vertical, diagonal). Combines the power of a rook and bishop.',
      strategyTip: 'Strategy: Avoid developing the queen too early — it can be chased around by weaker pieces.'
    },
    {
      symbol: '♜',
      name: 'Rook',
      badgeClass: 'rook',
      valueLabel: '5 points',
      moveDescription: 'Moves any number of squares horizontally or vertically. Very powerful in open files and the endgame. Participates in castling with the King.',
      strategyTip: 'Strategy: Connect your rooks on the first rank and place them on open or half-open files.'
    },
    {
      symbol: '♝',
      name: 'Bishop',
      badgeClass: 'bishop',
      valueLabel: '3 points',
      moveDescription: 'Moves diagonally any number of squares. Always stays on one color. Most effective in open positions with long diagonal lines of attack.',
      strategyTip: 'Strategy: Keep your bishops active and avoid blocking them with your own pawns.'
    },
    {
      symbol: '♞',
      name: 'Knight',
      badgeClass: 'knight',
      valueLabel: '3 points',
      moveDescription: 'Moves in an L-shape: two squares in one direction, then one square perpendicular. The only piece that can jump over other pieces.',
      strategyTip: 'Strategy: Knights are strongest near the center of the board, weakest at the edges.'
    },
    {
      symbol: '♟',
      name: 'Pawn',
      badgeClass: 'pawn',
      valueLabel: '1 point',
      moveDescription: 'Moves forward one square (or two from its starting position). Captures diagonally. Can promote to any piece upon reaching the 8th rank.',
      strategyTip: 'Strategy: Control the center with pawns and advance connected pawns together for strength.'
    }
  ];

  const openingsData = [
    {
      eco: 'E00',
      title: 'The Italian Game',
      moves: '1. e4 e5 · 2. Nf3 Nc6 · 3. Bc4',
      description: "One of the oldest openings in chess. White develops the bishop to the powerful c4 square, targeting Black's f7 pawn (the weakest point in the early game). Ideal for beginners: simple, principled, and aggressive."
    },
    {
      eco: 'B20',
      title: 'Sicilian Defense',
      moves: '1. e4 c5',
      description: 'The most popular response to 1.e4 at all levels. Black immediately fights for the center asymmetrically, leading to dynamic, imbalanced positions. Preferred by players who want to win with Black rather than draw.'
    },
    {
      eco: 'D00',
      title: "Queen's Gambit",
      moves: '1. d4 d5 · 2. c4',
      description: "White offers a pawn to gain central control. If Black takes it (Accepted), White can easily recapture and dominate the center. If Black declines (Declined), both sides build solid structures. A cornerstone of strategic chess."
    },
    {
      eco: 'A00',
      title: "King's Indian Defense",
      moves: '1. d4 Nf6 · 2. c4 g6 · 3. Nc3 Bg7',
      description: 'Black allows White to build a large pawn center, then attacks it with pieces. Highly aggressive and tactical. Favored by dynamic players who enjoy complex middlegame battles.'
    }
  ];

  const rulesData = [
    {
      icon: '👑',
      title: 'The Objective',
      text: "The goal of chess is to checkmate your opponent's King. Checkmate occurs when the King is under attack (in check) and has no legal escape — it cannot move to a safe square, no piece can block the attack, and the attacking piece cannot be captured. The game ends immediately at checkmate."
    },
    {
      icon: '⚔',
      title: 'Check & Checkmate',
      text: "A King is in check when it is directly attacked by an opponent's piece. When in check, you MUST address it on your next move — either move the King, block the attack with another piece, or capture the attacking piece. Ignoring check is an illegal move. Checkmate is when check cannot be resolved — this ends the game."
    },
    {
      icon: '🏰',
      title: 'Castling',
      text: 'A special move where the King moves two squares toward a Rook, and that Rook jumps to the other side of the King. Requirements: (1) Neither King nor Rook has moved previously. (2) No pieces stand between them. (3) The King is not currently in check. (4) The King does not pass through or land on an attacked square. Castling kingside (O-O) and queenside (O-O-O) are both available.'
    },
    {
      icon: '⬡',
      title: 'En Passant',
      text: "A special pawn capture that can only occur immediately after an opponent moves a pawn two squares forward from its starting position, landing beside your pawn. Your pawn may capture it \"in passing\" — moving diagonally to the square the opponent's pawn skipped over. This capture must be made on the very next move or the opportunity is permanently lost."
    },
    {
      icon: '👸',
      title: 'Pawn Promotion',
      text: 'When any pawn reaches the opposite end of the board (8th rank for White, 1st rank for Black), it must immediately be promoted to any other piece — Queen, Rook, Bishop, or Knight. Promotion to a Queen (queening) is the most common choice since the Queen is the most powerful piece. Under-promotion (to Rook, Bishop, or Knight) is occasionally used for tactical reasons.'
    },
    {
      icon: '🤝',
      title: 'Draws & Stalemate',
      text: 'The game can end in a draw (tie) several ways: Stalemate — a player has no legal moves but is NOT in check. Threefold Repetition — the same position occurs three times. 50-Move Rule — 50 moves pass with no pawn move or capture. Insufficient Material — neither side has enough pieces to achieve checkmate. Mutual Agreement — both players agree to draw.'
    }
  ];

  function selectScenario(scenarioId: ScenarioId) {
    if (onloadScenario) {
      onloadScenario(new CustomEvent('loadScenario', { detail: { scenarioId } }));
    }
  }
</script>

<div class="learn-view">
  <div class="learn-tabs">
    <button class="learn-tab" class:active={activeTab === 'pieces'} onclick={() => activeTab = 'pieces'}>♟ Piece Guide</button>
    <button class="learn-tab" class:active={activeTab === 'openings'} onclick={() => activeTab = 'openings'}>📘 Opening Principles</button>
    <button class="learn-tab" class:active={activeTab === 'rules'} onclick={() => activeTab = 'rules'}>📜 Rules & Objectives</button>
    <button class="learn-tab" class:active={activeTab === 'scenarios'} onclick={() => activeTab = 'scenarios'}>🧩 Beginner Scenarios</button>
  </div>

  <!-- PIECE GUIDE TAB -->
  <div class="learn-content" class:active={activeTab === 'pieces'}>
    <div class="section-heading">Complete Piece Reference</div>
    <div class="piece-grid">
      {#each piecesData as piece}
        <div class="piece-card">
          <div class="piece-symbol">{piece.symbol}</div>
          <div class="piece-name">{piece.name}</div>
          <div><span class="piece-value-badge {piece.badgeClass}">{piece.valueLabel}</span></div>
          <div class="piece-move-desc">{piece.moveDescription}</div>
          <div class="piece-role">{piece.strategyTip}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- OPENING PRINCIPLES TAB -->
  <div class="learn-content" class:active={activeTab === 'openings'}>
    <div class="section-heading">Fundamental Opening Principles</div>
    <div class="rule-card" style="margin-bottom:22px">
      <div class="rule-title"><span class="rule-icon">💡</span> Universal Principles for Beginners</div>
      <ul class="principle-list">
        <li>Control the center — the squares e4, e5, d4, d5 are the most strategically important</li>
        <li>Develop your pieces — move each piece once before moving any piece twice</li>
        <li>Castle early — secure your king behind a wall of pawns as quickly as possible</li>
        <li>Don't move your queen out early — she can be chased by developing enemy pieces</li>
        <li>Connect your rooks — move your bishops and knights first, then castle to connect</li>
      </ul>
    </div>

    <div class="section-heading">Essential Openings to Know</div>
    {#each openingsData as opening}
      <div class="opening-card">
        <div class="opening-eco">{opening.eco}</div>
        <div class="opening-title">{opening.title}</div>
        <div class="opening-moves">{opening.moves}</div>
        <div class="opening-desc">{opening.description}</div>
      </div>
    {/each}
  </div>

  <!-- RULES & OBJECTIVES TAB -->
  <div class="learn-content" class:active={activeTab === 'rules'}>
    <div class="section-heading">Core Rules & Special Mechanics</div>
    {#each rulesData as rule}
      <div class="rule-card">
        <div class="rule-title"><span class="rule-icon">{rule.icon}</span> {rule.title}</div>
        <div class="rule-text">{@html rule.text.replace(/Stalemate|Threefold Repetition|50-Move Rule|Insufficient Material|Mutual Agreement|check|Checkmate/g, (m) => `<strong style="color:var(--cream)">${m}</strong>`)}</div>
      </div>
    {/each}
  </div>

  <!-- BEGINNER SCENARIOS TAB -->
  <div class="learn-content" class:active={activeTab === 'scenarios'}>
    <div class="section-heading">Beginner Practice Scenarios</div>
    <div class="scenario-grid">
      {#each SCENARIO_ORDER as id}
        {@const scenario = SCENARIOS[id]}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="scenario-card" onclick={() => selectScenario(id)}>
          <div class="scenario-type-badge {scenario.type.toLowerCase()}">{scenario.type}</div>
          <div class="scenario-title">{scenario.title}</div>
          <div class="scenario-desc">{scenario.description}</div>
          <MiniBoard board={scenario.board} />
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .learn-view {
    display: flex;
    flex-direction: column;
  }

  .learn-tabs {
    display: flex;
    gap: 4px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 5px;
    margin-bottom: 22px;
  }

  .learn-tab {
    flex: 1;
    padding: 9px 16px;
    border-radius: 7px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }

  .learn-tab:hover {
    color: var(--text-primary);
  }

  .learn-tab.active {
    background: var(--bg-panel);
    color: var(--gold);
    border: 1px solid rgba(196, 160, 87, 0.2);
  }

  .learn-content {
    display: none;
  }

  .learn-content.active {
    display: block;
  }

  .piece-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .piece-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s;
  }

  .piece-card:hover {
    border-color: var(--border-glow);
    transform: translateY(-2px);
  }

  .piece-symbol {
    font-size: 48px;
    line-height: 1;
    margin-bottom: 10px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .piece-name {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 4px;
  }

  .piece-value-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    font-family: 'DM Mono', monospace;
    margin-bottom: 10px;
  }

  .piece-value-badge.pawn {
    background: rgba(100, 180, 100, 0.15);
    color: #80d080;
  }

  .piece-value-badge.knight {
    background: rgba(100, 150, 220, 0.15);
    color: #80b0e0;
  }

  .piece-value-badge.bishop {
    background: rgba(100, 150, 220, 0.15);
    color: #80b0e0;
  }

  .piece-value-badge.rook {
    background: rgba(196, 160, 87, 0.15);
    color: var(--gold);
  }

  .piece-value-badge.queen {
    background: rgba(180, 80, 180, 0.15);
    color: #d080d0;
  }

  .piece-value-badge.king {
    background: rgba(220, 70, 70, 0.15);
    color: #e08080;
  }

  .piece-move-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.55;
  }

  .piece-role {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 8px;
    font-style: italic;
  }

  .opening-card,
  .rule-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 14px;
  }

  .opening-card:hover,
  .rule-card:hover {
    border-color: var(--border-glow);
  }

  .opening-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 6px;
  }

  .opening-eco {
    display: inline-block;
    padding: 2px 7px;
    background: var(--gold-dim);
    color: var(--gold);
    border-radius: 4px;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    font-weight: 500;
    margin-bottom: 10px;
  }

  .opening-moves {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--blue-light);
    background: var(--bg-panel);
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 10px;
    border: 1px solid var(--border);
  }

  .opening-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .principle-list {
    list-style: none;
    padding: 0;
    margin-top: 10px;
  }

  .principle-list li {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 5px 0;
    font-size: 13px;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border);
  }

  .principle-list li:last-child {
    border-bottom: none;
  }

  .principle-list li::before {
    content: '→';
    color: var(--gold);
    margin-top: 1px;
    flex-shrink: 0;
  }

  .rule-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rule-icon {
    font-size: 18px;
  }

  .rule-text {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.65;
  }

  .scenario-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .scenario-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .scenario-card:hover {
    border-color: var(--border-glow);
    background: var(--bg-panel);
    transform: translateY(-2px);
  }

  .scenario-type-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }

  .scenario-type-badge.tactic {
    background: rgba(196, 160, 87, 0.15);
    color: var(--gold);
  }

  .scenario-type-badge.endgame {
    background: rgba(74, 127, 165, 0.15);
    color: #6aa3d0;
  }

  .scenario-type-badge.pattern {
    background: rgba(130, 80, 180, 0.15);
    color: #b090d0;
  }

  .scenario-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 6px;
  }

  .scenario-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
  }
</style>
