import { writable, get } from 'svelte/store';
import type { GameState, Difficulty, PieceType, ScenarioId } from '$lib/types';
import {
  defaultBoard,
  defaultCastlingRights,
  getLegalMoves,
  makeMove,
  pieceColor,
  pieceType,
} from '$lib/chess/engine';
import { getBestMove } from '$lib/chess/ai';
import { gameOverState } from './gameOver';
import { promotionState } from './promotion';
import { SCENARIOS } from '$lib/chess/scenarios';

// ── AI-specific reactive state ────────────────────────────────────────────────

export const difficulty     = writable<Difficulty>('easy');
export const showHints      = writable<boolean>(true);
export const showLastMove   = writable<boolean>(true);
export const showLabels     = writable<boolean>(false);
export const isAIThinking   = writable<boolean>(false);
export const aiDiffLabel    = writable<string>('Easy Mode');

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy:         'Full move hints enabled. AI plays slow, predictable moves. Piece names visible on the board. Perfect for learning the basics.',
  medium:       'Moderate strategy. AI applies basic opening principles. Balanced challenge for casual players. Introduces tactical awareness.',
  intermediate: 'AI plays competitive chess with tactical awareness. Focuses on mid-game strategy. Hints available on request.',
  hard:         'Near-optimal play. AI applies deep strategic and tactical calculation. Maximum challenge with endgame mastery focus.',
};

// ── Game state store ──────────────────────────────────────────────────────────

function createAIGameStore() {
  const INITIAL_STATE: GameState = {
    board:           defaultBoard(),
    turn:            'w',
    selected:        null,
    legalMoves:      [],
    moveHistory:     [],
    castlingRights:  defaultCastlingRights(),
    enPassantSquare: null,
    capturedByWhite: [],
    capturedByBlack: [],
    isGameOver:      false,
  };

  const { subscribe, set, update } = writable<GameState>({ ...INITIAL_STATE });

  // ── Public interface ───────────────────────────────────────────────────────

  function init(): void {
    set({
      board:           defaultBoard(),
      turn:            'w',
      selected:        null,
      legalMoves:      [],
      moveHistory:     [],
      castlingRights:  defaultCastlingRights(),
      enPassantSquare: null,
      capturedByWhite: [],
      capturedByBlack: [],
      isGameOver:      false,
    });
  }

  function loadScenario(id: ScenarioId): void {
    const scenario = SCENARIOS[id];
    if (!scenario) return;
    set({
      board:           scenario.board.map((r) => [...r]),
      turn:            'w',
      selected:        null,
      legalMoves:      [],
      moveHistory:     [],
      castlingRights:  defaultCastlingRights(),
      enPassantSquare: null,
      capturedByWhite: [],
      capturedByBlack: [],
      isGameOver:      false,
    });
  }

  async function handleSquareClick(r: number, f: number): Promise<void> {
    const state = get({ subscribe });
    if (state.isGameOver) return;
    if (state.turn === 'b') return; // AI's turn

    const piece = state.board[r][f];

    if (state.selected) {
      const [sr, sf] = state.selected;
      const move = state.legalMoves.find((m) => m[0] === r && m[1] === f);

      if (move) {
        const movingPiece = state.board[sr][sf];
        if (!movingPiece) return;

        // Promotion?
        if (pieceType(movingPiece) === 'P' && (r === 0 || r === 7)) {
          const color = pieceColor(movingPiece);
          if (!color) return;
          const chosen: PieceType = await promotionState.request({
            fr: sr, ff: sf, tr: r, tf: f,
            color,
            mode: 'ai',
          });
          update((s) => makeMove(s, sr, sf, r, f, chosen, 'ai', gameOverState));
          _scheduleAIMove();
          return;
        }

        update((s) => makeMove(s, sr, sf, r, f, null, 'ai', gameOverState));
        _scheduleAIMove();
        return;
      }

      // Deselect
      update((s) => ({ ...s, selected: null, legalMoves: [] }));
    }

    if (piece && pieceColor(piece) === state.turn) {
      const legal = getLegalMoves(get({ subscribe }), r, f);
      update((s) => ({ ...s, selected: [r, f], legalMoves: legal }));
    }
  }

  function undoMove(): void {
    update((s) => {
      if (s.moveHistory.length < 2 || s.isGameOver) return s;
      const savedHistory = s.moveHistory.slice(0, -2);
      let next: GameState = {
        board:           defaultBoard(),
        turn:            'w',
        selected:        null,
        legalMoves:      [],
        moveHistory:     [],
        castlingRights:  defaultCastlingRights(),
        enPassantSquare: null,
        capturedByWhite: [],
        capturedByBlack: [],
        isGameOver:      false,
      };
      for (const mv of savedHistory) {
        const legal = getLegalMoves(next, mv.fr, mv.ff);
        next = { ...next, legalMoves: legal };
        next = makeMove(next, mv.fr, mv.ff, mv.tr, mv.tf, mv.promo, 'ai', gameOverState);
      }
      return savedHistory.length === 0 ? next : next;
    });
  }

  function resign(): void {
    update((s) => {
      if (s.isGameOver) return s;
      gameOverState.show('♛', 'You Resigned', 'Better luck next time! Study the Learning Hub to improve.', 'ai');
      return { ...s, isGameOver: true };
    });
  }

  function setDifficulty(d: Difficulty): void {
    difficulty.set(d);
    const LABEL_MAP: Record<Difficulty, string> = {
      easy: 'Easy Mode', medium: 'Medium Mode',
      intermediate: 'Intermediate Mode', hard: 'Hard Mode',
    };
    aiDiffLabel.set(LABEL_MAP[d]);
  }

  // ── Private: AI scheduling ─────────────────────────────────────────────────

  function _scheduleAIMove(): void {
    const state = get({ subscribe });
    if (state.isGameOver || state.turn !== 'b') return;

    isAIThinking.set(true);
    const diff = get(difficulty);
    const DELAY: Record<Difficulty, number> = {
      easy: 600, medium: 900, intermediate: 1200, hard: 1600,
    };
    const delay = DELAY[diff] + Math.random() * 300;

    setTimeout(() => {
      isAIThinking.set(false);
      const current = get({ subscribe });
      if (current.isGameOver || current.turn !== 'b') return;

      const aiMove = getBestMove(current, diff);
      if (!aiMove) return;

      const [fr, ff, tr, tf] = aiMove;
      const movingPiece = current.board[fr][ff];
      const promo: PieceType | null =
        movingPiece && pieceType(movingPiece) === 'P' && (tr === 0 || tr === 7) ? 'Q' : null;

      update((s) => makeMove(s, fr, ff, tr, tf, promo, 'ai', gameOverState));
    }, delay);
  }

  return {
    subscribe,
    init,
    loadScenario,
    handleSquareClick,
    undoMove,
    resign,
    setDifficulty,
  };
}

export const aiGameStore = createAIGameStore();
