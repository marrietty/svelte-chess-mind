/**
 * chess/engine.ts
 * Pure, side-effect-free chess logic.
 * All functions are strictly typed — no `any`.
 */

import type {
  Board,
  Cell,
  Color,
  PieceCode,
  PieceType,
  RawMove,
  MoveFlag,
  MoveRecord,
  GameState,
  CastlingRights,
  Square,
} from '$lib/types';
import type { gameOverState } from '$lib/stores/gameOver';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const PIECES: Record<PieceCode, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};

export const PIECE_IMAGES: Record<PieceCode, string> = {
  wK: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  wQ: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  wR: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  wB: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  wN: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  wP: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  bK: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
  bQ: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  bR: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  bB: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  bN: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  bP: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
};

export const PIECE_VALUES: Record<PieceType, number> = {
  K: 999, Q: 9, R: 5, B: 3, N: 3, P: 1,
};

export const FILES: readonly string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// ─────────────────────────────────────────────────────────────────────────────
// BOARD FACTORIES
// ─────────────────────────────────────────────────────────────────────────────

export function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array<Cell>(8).fill(null));
}

export function defaultCastlingRights(): CastlingRights {
  return { wK: true, wQ: true, bK: true, bQ: true };
}

export function defaultBoard(): Board {
  const b = emptyBoard();
  const backRow: PieceType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let f = 0; f < 8; f++) {
    b[0][f] = `b${backRow[f]}` as PieceCode;
    b[1][f] = 'bP';
    b[6][f] = 'wP';
    b[7][f] = `w${backRow[f]}` as PieceCode;
  }
  return b;
}

export function cloneBoard(b: Board): Board {
  return b.map((row) => [...row]);
}

// ─────────────────────────────────────────────────────────────────────────────
// PIECE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function pieceColor(p: Cell): Color | null {
  return p ? (p[0] as Color) : null;
}

export function pieceType(p: Cell): PieceType | null {
  return p ? (p[1] as PieceType) : null;
}

export function opponent(c: Color): Color {
  return c === 'w' ? 'b' : 'w';
}

function inBounds(r: number, f: number): boolean {
  return r >= 0 && r < 8 && f >= 0 && f < 8;
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTACK / LEGAL MOVE GENERATION
// ─────────────────────────────────────────────────────────────────────────────

export function isAttacked(board: Board, row: number, col: number, byColor: Color): boolean {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (p && pieceColor(p) === byColor) {
        const moves = rawMoves(board, r, f, null, null);
        if (moves.some((m) => m[0] === row && m[1] === col)) return true;
      }
    }
  }
  return false;
}

export function rawMoves(
  board: Board,
  row: number,
  col: number,
  castlingRights: CastlingRights | null,
  enPassant: Square | null,
): RawMove[] {
  const p = board[row][col];
  if (!p) return [];

  const c = pieceColor(p) as Color;
  const t = pieceType(p) as PieceType;
  const moves: RawMove[] = [];

  function slide(dr: number, df: number): void {
    let r = row + dr;
    let f = col + df;
    while (inBounds(r, f)) {
      if (board[r][f]) {
        if (pieceColor(board[r][f]) !== c) moves.push([r, f]);
        break;
      }
      moves.push([r, f]);
      r += dr;
      f += df;
    }
  }

  if (t === 'P') {
    const dir = c === 'w' ? -1 : 1;
    const startRow = c === 'w' ? 6 : 1;
    if (inBounds(row + dir, col) && !board[row + dir][col]) {
      moves.push([row + dir, col]);
      if (row === startRow && !board[row + 2 * dir][col]) {
        moves.push([row + 2 * dir, col]);
      }
    }
    for (const df of [-1, 1]) {
      if (inBounds(row + dir, col + df)) {
        const target = board[row + dir][col + df];
        if (target && pieceColor(target) !== c) moves.push([row + dir, col + df]);
        if (enPassant && enPassant[0] === row + dir && enPassant[1] === col + df) {
          moves.push([row + dir, col + df]);
        }
      }
    }
  } else if (t === 'N') {
    const knightDeltas: [number, number][] = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2],  [1, 2],  [2, -1], [2, 1],
    ];
    for (const [dr, df] of knightDeltas) {
      const r = row + dr;
      const f = col + df;
      if (inBounds(r, f) && pieceColor(board[r][f]) !== c) moves.push([r, f]);
    }
  } else if (t === 'B') {
    slide(-1, -1); slide(-1, 1); slide(1, -1); slide(1, 1);
  } else if (t === 'R') {
    slide(-1, 0); slide(1, 0); slide(0, -1); slide(0, 1);
  } else if (t === 'Q') {
    slide(-1, -1); slide(-1, 1); slide(1, -1); slide(1, 1);
    slide(-1, 0);  slide(1, 0);  slide(0, -1); slide(0, 1);
  } else if (t === 'K') {
    const kingDeltas: [number, number][] = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];
    for (const [dr, df] of kingDeltas) {
      const r = row + dr;
      const f = col + df;
      if (inBounds(r, f) && pieceColor(board[r][f]) !== c) moves.push([r, f]);
    }

    // Castling
    if (castlingRights) {
      const opp = opponent(c);
      if (c === 'w' && row === 7) {
        if (
          castlingRights.wK &&
          !board[7][5] && !board[7][6] &&
          !isAttacked(board, 7, 4, opp) &&
          !isAttacked(board, 7, 5, opp) &&
          !isAttacked(board, 7, 6, opp)
        ) moves.push([7, 6, 'castle-K']);

        if (
          castlingRights.wQ &&
          !board[7][3] && !board[7][2] && !board[7][1] &&
          !isAttacked(board, 7, 4, opp) &&
          !isAttacked(board, 7, 3, opp) &&
          !isAttacked(board, 7, 2, opp)
        ) moves.push([7, 2, 'castle-Q']);
      }
      if (c === 'b' && row === 0) {
        if (
          castlingRights.bK &&
          !board[0][5] && !board[0][6] &&
          !isAttacked(board, 0, 4, opp) &&
          !isAttacked(board, 0, 5, opp) &&
          !isAttacked(board, 0, 6, opp)
        ) moves.push([0, 6, 'castle-K']);

        if (
          castlingRights.bQ &&
          !board[0][3] && !board[0][2] && !board[0][1] &&
          !isAttacked(board, 0, 4, opp) &&
          !isAttacked(board, 0, 3, opp) &&
          !isAttacked(board, 0, 2, opp)
        ) moves.push([0, 2, 'castle-Q']);
      }
    }
  }

  return moves;
}

export function getLegalMoves(state: GameState, row: number, col: number): RawMove[] {
  const p = state.board[row][col];
  if (!p || pieceColor(p) !== state.turn) return [];

  const raw = rawMoves(state.board, row, col, state.castlingRights, state.enPassantSquare);
  return raw.filter((m) => {
    const b2 = cloneBoard(state.board);
    applyMoveToBoard(b2, row, col, m[0], m[1], null, state.enPassantSquare, m[2] ?? null);
    const kingPos = findKing(b2, state.turn);
    return kingPos !== null && !isAttacked(b2, kingPos[0], kingPos[1], opponent(state.turn));
  });
}

export function findKing(board: Board, color: Color): Square | null {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      if (board[r][f] === `${color}K`) return [r, f];
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOARD MUTATION
// ─────────────────────────────────────────────────────────────────────────────

export function applyMoveToBoard(
  board: Board,
  fr: number,
  ff: number,
  tr: number,
  tf: number,
  promo: PieceType | null,
  enPassant: Square | null,
  flag: MoveFlag | null,
): PieceCode | null {
  const p = board[fr][ff] as PieceCode;
  let captured: PieceCode | null = board[tr][tf] as PieceCode | null;

  // En passant capture
  if (pieceType(p) === 'P' && enPassant && tr === enPassant[0] && tf === enPassant[1]) {
    const epDir = pieceColor(p) === 'w' ? 1 : -1;
    captured = board[tr + epDir][tf] as PieceCode | null;
    board[tr + epDir][tf] = null;
  }

  board[tr][tf] = promo ? (`${pieceColor(p)}${promo}` as PieceCode) : p;
  board[fr][ff] = null;

  // Rook repositioning for castling
  if (flag === 'castle-K') {
    if (tr === 7) { board[7][5] = 'wR'; board[7][7] = null; }
    else          { board[0][5] = 'bR'; board[0][7] = null; }
  }
  if (flag === 'castle-Q') {
    if (tr === 7) { board[7][3] = 'wR'; board[7][0] = null; }
    else          { board[0][3] = 'bR'; board[0][0] = null; }
  }

  return captured;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAKE MOVE (produces new immutable GameState)
// ─────────────────────────────────────────────────────────────────────────────

type GameOverStore = typeof gameOverState;

export function makeMove(
  state: GameState,
  fr: number,
  ff: number,
  tr: number,
  tf: number,
  promo: PieceType | null,
  mode: 'ai' | 'pvp',
  gameOver: GameOverStore,
): GameState {
  const board = cloneBoard(state.board);
  const p = board[fr][ff] as PieceCode;

  const moveFlag = state.legalMoves.find((m) => m[0] === tr && m[1] === tf)?.[2] ?? null;
  const captured = applyMoveToBoard(board, fr, ff, tr, tf, promo, state.enPassantSquare, moveFlag);

  const capturedByWhite = [...state.capturedByWhite];
  const capturedByBlack = [...state.capturedByBlack];
  if (captured) {
    if (pieceColor(p) === 'w') capturedByWhite.push(captured);
    else capturedByBlack.push(captured);
  }

  // En passant tracking
  let enPassantSquare: Square | null = null;
  if (pieceType(p) === 'P' && Math.abs(tr - fr) === 2) {
    enPassantSquare = [(fr + tr) / 2, ff];
  }

  // Castling rights
  const castlingRights: CastlingRights = { ...state.castlingRights };
  if (pieceType(p) === 'K') {
    if (pieceColor(p) === 'w') { castlingRights.wK = false; castlingRights.wQ = false; }
    else                        { castlingRights.bK = false; castlingRights.bQ = false; }
  }
  if (pieceType(p) === 'R') {
    if (fr === 7 && ff === 7) castlingRights.wK = false;
    if (fr === 7 && ff === 0) castlingRights.wQ = false;
    if (fr === 0 && ff === 7) castlingRights.bK = false;
    if (fr === 0 && ff === 0) castlingRights.bQ = false;
  }

  const moveRecord: MoveRecord = { fr, ff, tr, tf, piece: p, captured, promo };
  const moveHistory = [...state.moveHistory, moveRecord];
  const turn = opponent(state.turn);

  const next: GameState = {
    board,
    turn,
    selected: null,
    legalMoves: [],
    moveHistory,
    castlingRights,
    enPassantSquare,
    capturedByWhite,
    capturedByBlack,
    isGameOver: false,
  };

  // Check for check / checkmate / stalemate
  checkGameState(next, mode, gameOver);
  return next;
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME STATE CHECK (side-effecting only on gameOverStore)
// ─────────────────────────────────────────────────────────────────────────────

function checkGameState(
  state: GameState,
  mode: 'ai' | 'pvp',
  gameOver: GameOverStore,
): void {
  const c = state.turn;
  const opp = opponent(c);
  const kingPos = findKing(state.board, c);
  if (!kingPos) return;

  const inCheck = isAttacked(state.board, kingPos[0], kingPos[1], opp);

  let hasLegal = false;
  outer: for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      if (state.board[r][f] && pieceColor(state.board[r][f]) === c) {
        if (getLegalMoves(state, r, f).length > 0) {
          hasLegal = true;
          break outer;
        }
      }
    }
  }

  if (!hasLegal) {
    state.isGameOver = true;
    if (inCheck) {
      if (mode === 'ai') {
        const title = opp === 'w' ? 'You Win!' : 'AI Wins!';
        const sub   = opp === 'w' ? 'You delivered checkmate to the AI.' : 'The AI delivered checkmate. Keep practicing!';
        gameOver.show('♛', title, sub, 'ai');
      } else {
        const winner = opp === 'w' ? 'Player 1' : 'Player 2';
        gameOver.show('♛', `${winner} Wins!`, `${winner} delivered checkmate!`, 'pvp');
      }
    } else {
      gameOver.show('🤝', 'Stalemate!', 'The game ends in a draw — no legal moves available.', mode);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MOVE NOTATION
// ─────────────────────────────────────────────────────────────────────────────

export function moveToNotation(mv: MoveRecord): string {
  const t = pieceType(mv.piece);
  const prefix = t === 'P' ? '' : (t ?? '');
  const capture = mv.captured ? 'x' : '';
  const fileSrc = t === 'P' && mv.captured ? FILES[mv.ff] : '';
  const dest = FILES[mv.tf] + (8 - mv.tr);
  const promoStr = mv.promo ? `=${mv.promo}` : '';
  return (prefix || fileSrc) + capture + dest + promoStr;
}
