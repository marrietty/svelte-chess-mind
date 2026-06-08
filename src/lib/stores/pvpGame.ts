import { writable, get } from 'svelte/store';
import type { PvpState, PieceType } from '$lib/types';
import {
  defaultBoard,
  defaultCastlingRights,
  getLegalMoves,
  makeMove,
  pieceColor,
  pieceType,
} from '$lib/chess/engine';
import { gameOverState } from './gameOver';
import { promotionState } from './promotion';

function createPvpGameStore() {
  const INITIAL: PvpState = {
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
    p1Wins:          0,
    p2Wins:          0,
    gameHistory:     [],
  };

  const { subscribe, update } = writable<PvpState>({ ...INITIAL });

  function init(): void {
    update((s) => ({
      ...s,
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
      // Keep session score across games
    }));
  }

  async function handleSquareClick(r: number, f: number): Promise<void> {
    const state = get({ subscribe });
    if (state.isGameOver) return;

    const piece = state.board[r][f];

    if (state.selected) {
      const [sr, sf] = state.selected;
      const move = state.legalMoves.find((m) => m[0] === r && m[1] === f);

      if (move) {
        const movingPiece = state.board[sr][sf];
        if (!movingPiece) return;

        if (pieceType(movingPiece) === 'P' && (r === 0 || r === 7)) {
          const color = pieceColor(movingPiece);
          if (!color) return;
          const chosen: PieceType = await promotionState.request({
            fr: sr, ff: sf, tr: r, tf: f,
            color,
            mode: 'pvp',
          });
          update((s) => makeMove(s, sr, sf, r, f, chosen, 'pvp', gameOverState) as PvpState);
          return;
        }

        update((s) => makeMove(s, sr, sf, r, f, null, 'pvp', gameOverState) as PvpState);
        return;
      }

      update((s) => ({ ...s, selected: null, legalMoves: [] }));
    }

    if (piece && pieceColor(piece) === state.turn) {
      const legal = getLegalMoves(get({ subscribe }), r, f);
      update((s) => ({ ...s, selected: [r, f], legalMoves: legal }));
    }
  }

  function undoMove(): void {
    update((s) => {
      if (s.moveHistory.length < 1 || s.isGameOver) return s;
      const savedHistory = s.moveHistory.slice(0, -1);
      let next: PvpState = {
        ...s,
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
        next = makeMove(next, mv.fr, mv.ff, mv.tr, mv.tf, mv.promo, 'pvp', gameOverState) as PvpState;
      }
      return next;
    });
  }

  /** Called by the game-over handler when black/white wins in PvP */
  function recordWin(winner: 'Player 1' | 'Player 2' | 'Draw', result: 'Checkmate' | 'Stalemate' | 'Resign'): void {
    update((s) => ({
      ...s,
      p1Wins: winner === 'Player 1' ? s.p1Wins + 1 : s.p1Wins,
      p2Wins: winner === 'Player 2' ? s.p2Wins + 1 : s.p2Wins,
      gameHistory: [{ winner, result }, ...s.gameHistory],
    }));
  }

  return {
    subscribe,
    init,
    handleSquareClick,
    undoMove,
    recordWin,
  };
}

export const pvpGameStore = createPvpGameStore();
