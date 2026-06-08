/**
 * chess/ai.ts
 * AI move selection algorithms for each difficulty level.
 * Pure functions — no side effects.
 */

import type { GameState, Difficulty, AIMove } from '$lib/types';
import {
  getLegalMoves,
  cloneBoard,
  applyMoveToBoard,
  pieceColor,
  pieceType,
  PIECE_VALUES,
} from './engine';

// ─────────────────────────────────────────────────────────────────────────────
// COLLECT ALL LEGAL MOVES FOR A COLOR
// ─────────────────────────────────────────────────────────────────────────────

export function getAllMoves(state: GameState, color: 'b' | 'w'): AIMove[] {
  const moves: AIMove[] = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      if (state.board[r][f] && pieceColor(state.board[r][f]) === color) {
        const legal = getLegalMoves(state, r, f);
        for (const m of legal) {
          moves.push([r, f, m[0], m[1], null]);
        }
      }
    }
  }
  return moves;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC EVALUATION
// ─────────────────────────────────────────────────────────────────────────────

export function evaluateBoard(board: GameState['board'], color: 'b' | 'w'): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (!p) continue;
      const t = pieceType(p);
      if (!t) continue;
      const val = PIECE_VALUES[t] ?? 0;
      const centerBonus = r >= 2 && r <= 5 && f >= 2 && f <= 5 ? 0.1 : 0;
      const posScore = val + centerBonus;
      if (pieceColor(p) === color) score += posScore;
      else score -= posScore;
    }
  }
  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY
// ─────────────────────────────────────────────────────────────────────────────

export function getBestMove(state: GameState, diff: Difficulty): AIMove | null {
  const moves = getAllMoves(state, 'b');
  if (moves.length === 0) return null;

  switch (diff) {
    case 'easy':
      return _easyMove(state, moves);
    case 'medium':
      return _mediumMove(state, moves);
    case 'intermediate':
      return _intermediateMove(state, moves);
    case 'hard':
      return _hardMove(state, moves);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DIFFICULTY IMPLEMENTATIONS
// ─────────────────────────────────────────────────────────────────────────────

function _easyMove(state: GameState, moves: AIMove[]): AIMove {
  const captures = moves.filter((m) => state.board[m[2]][m[3]] !== null);
  if (captures.length > 0 && Math.random() < 0.4) {
    return captures[Math.floor(Math.random() * captures.length)];
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

function _mediumMove(state: GameState, moves: AIMove[]): AIMove {
  let best: AIMove | null = null;
  let bestVal = -999;

  for (const m of moves) {
    const target = state.board[m[2]][m[3]];
    const t = target ? pieceType(target) : null;
    const val = t ? (PIECE_VALUES[t] ?? 0) : 0;
    if (val > bestVal) {
      bestVal = val;
      best = m;
    }
  }

  return bestVal > 0 && best !== null
    ? best
    : moves[Math.floor(Math.random() * moves.length)];
}

function _intermediateMove(state: GameState, moves: AIMove[]): AIMove {
  let best: AIMove | null = null;
  let bestScore = -999;

  for (const m of moves) {
    const b2 = cloneBoard(state.board);
    applyMoveToBoard(b2, m[0], m[1], m[2], m[3], null, state.enPassantSquare, null);
    const score = evaluateBoard(b2, 'b') + Math.random() * 0.3;
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }

  return best ?? moves[0];
}

function _hardMove(state: GameState, moves: AIMove[]): AIMove {
  let best: AIMove | null = null;
  let bestScore = -999;

  for (const m of moves) {
    const b2 = cloneBoard(state.board);
    applyMoveToBoard(b2, m[0], m[1], m[2], m[3], null, state.enPassantSquare, null);

    // White responds with best counter
    let worstResponse = 999;
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        if (b2[r][f] && pieceColor(b2[r][f]) === 'w') {
          const tempState: GameState = {
            board:           b2,
            turn:            'w',
            castlingRights:  { ...state.castlingRights },
            enPassantSquare: null,
            selected:        null,
            legalMoves:      [],
            moveHistory:     [],
            capturedByWhite: [],
            capturedByBlack: [],
            isGameOver:      false,
          };
          const wMoves = getLegalMoves(tempState, r, f);
          for (const wm of wMoves) {
            const b3 = cloneBoard(b2);
            applyMoveToBoard(b3, r, f, wm[0], wm[1], null, null, null);
            const s = evaluateBoard(b3, 'b');
            if (s < worstResponse) worstResponse = s;
          }
        }
      }
    }

    const finalScore = worstResponse + Math.random() * 0.1;
    if (finalScore > bestScore) {
      bestScore = finalScore;
      best = m;
    }
  }

  return best ?? moves[0];
}
