/**
 * chess/scenarios.ts
 * Pre-built board positions used in the Learning Hub → Beginner Scenarios tab.
 */

import type { Scenario, ScenarioId } from '$lib/types';
import { emptyBoard } from './engine';

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

function buildScholars(): Scenario['board'] {
  const b = emptyBoard();
  b[7][4] = 'wK'; b[7][3] = 'wQ'; b[7][5] = 'wB'; b[7][6] = 'wN';
  b[7][1] = 'wN'; b[7][0] = 'wR'; b[7][7] = 'wR';
  b[5][4] = 'wP'; b[6][3] = 'wP'; b[6][5] = 'wQ';
  b[0][4] = 'bK'; b[1][3] = 'bP'; b[1][4] = 'bP'; b[1][5] = 'bP';
  b[0][3] = 'bQ'; b[0][5] = 'bB'; b[2][2] = 'bN'; b[1][2] = 'bP';
  return b;
}

function buildFork(): Scenario['board'] {
  const b = emptyBoard();
  b[7][4] = 'wK'; b[4][3] = 'wN'; b[0][4] = 'bK'; b[2][2] = 'bR'; b[2][4] = 'bQ';
  return b;
}

function buildPin(): Scenario['board'] {
  const b = emptyBoard();
  b[7][4] = 'wK'; b[4][4] = 'wB'; b[2][4] = 'bN'; b[0][4] = 'bK'; b[3][2] = 'bP';
  return b;
}

function buildEndgame(): Scenario['board'] {
  const b = emptyBoard();
  b[5][4] = 'wK'; b[4][4] = 'wP'; b[2][4] = 'bK';
  return b;
}

function buildCastling(): Scenario['board'] {
  const b = emptyBoard();
  b[7][4] = 'wK'; b[7][7] = 'wR'; b[7][0] = 'wR';
  b[6][4] = 'wP'; b[6][3] = 'wP'; b[6][5] = 'wP';
  b[0][4] = 'bK'; b[0][7] = 'bR'; b[0][0] = 'bR';
  b[1][4] = 'bP'; b[1][3] = 'bP'; b[1][5] = 'bP';
  return b;
}

function buildPromotion(): Scenario['board'] {
  const b = emptyBoard();
  b[7][6] = 'wK'; b[1][4] = 'wP'; b[0][6] = 'bK'; b[6][2] = 'bP';
  return b;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT MAP
// ─────────────────────────────────────────────────────────────────────────────

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  scholars: {
    id: 'scholars',
    type: 'Tactic',
    title: "Scholar's Mate Setup",
    description: "Recognize and defend against the quickest checkmate. Learn why protecting f7 is critical in the early game.",
    board: buildScholars(),
  },
  fork: {
    id: 'fork',
    type: 'Tactic',
    title: 'Knight Fork Pattern',
    description: "Practice the knight's unique L-shape movement to simultaneously attack two pieces — a fundamental tactical motif.",
    board: buildFork(),
  },
  pin: {
    id: 'pin',
    type: 'Pattern',
    title: 'Absolute Pin',
    description: 'Identify when a piece is pinned to the king and cannot legally move — one of the most common tactical themes in chess.',
    board: buildPin(),
  },
  endgame: {
    id: 'endgame',
    type: 'Endgame',
    title: 'King & Pawn Endgame',
    description: 'Master the fundamental king opposition technique to promote your pawn and convert a basic endgame win.',
    board: buildEndgame(),
  },
  castling: {
    id: 'castling',
    type: 'Pattern',
    title: 'When to Castle',
    description: 'Practice recognizing the right time to castle and the conditions required for both kingside and queenside castling.',
    board: buildCastling(),
  },
  promotion: {
    id: 'promotion',
    type: 'Endgame',
    title: 'Pawn Promotion Race',
    description: 'Determine which pawn queens first using basic counting and the "rule of the square" — essential pawn endgame knowledge.',
    board: buildPromotion(),
  },
};

export const SCENARIO_ORDER: ScenarioId[] = [
  'scholars', 'fork', 'pin', 'endgame', 'castling', 'promotion',
];
