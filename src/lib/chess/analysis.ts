import { getLegalMoves, pieceColor, pieceType } from '$lib/chess/engine';
import type { GameState } from '$lib/types';

export interface CaptureOpportunity {
  fr: number;
  ff: number;
  tr: number;
  tf: number;
  piece: string;        // Human-readable piece name (e.g. "Bishop")
  target: string;       // Human-readable target name (e.g. "Knight")
  notationFrom: string; // Algebraic coordinate (e.g. "c1")
  notationTo: string;   // Algebraic coordinate (e.g. "f4")
}

const PIECE_NAMES: Record<string, string> = {
  K: 'King',
  Q: 'Queen',
  R: 'Rook',
  B: 'Bishop',
  N: 'Knight',
  P: 'Pawn'
};

function getPieceName(code: string): string {
  const t = code[1];
  return PIECE_NAMES[t] || '';
}

function coordToNotation(r: number, f: number): string {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  return files[f] + ranks[r];
}

export function getCaptureOpportunities(state: GameState): CaptureOpportunity[] {
  if (state.isGameOver) return [];
  const opportunities: CaptureOpportunity[] = [];
  const board = state.board;
  const turn = state.turn;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece && pieceColor(piece) === turn) {
        // Find legal moves for this piece
        const moves = getLegalMoves(state, r, f);
        for (const [tr, tf] of moves) {
          const targetPiece = board[tr][tf];
          let isCapture = false;
          let targetName = '';

          if (targetPiece && pieceColor(targetPiece) !== turn) {
            isCapture = true;
            targetName = getPieceName(targetPiece);
          } else if (
            pieceType(piece) === 'P' &&
            state.enPassantSquare &&
            tr === state.enPassantSquare[0] &&
            tf === state.enPassantSquare[1]
          ) {
            // En passant capture
            isCapture = true;
            targetName = 'Pawn';
          }

          if (isCapture) {
            opportunities.push({
              fr: r,
              ff: f,
              tr,
              tf,
              piece: getPieceName(piece),
              target: targetName,
              notationFrom: coordToNotation(r, f),
              notationTo: coordToNotation(tr, tf)
            });
          }
        }
      }
    }
  }

  return opportunities;
}
