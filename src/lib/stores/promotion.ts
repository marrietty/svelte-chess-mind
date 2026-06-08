import { writable } from 'svelte/store';
import type { Color, PieceType, PendingPromotion } from '$lib/types';

interface PromotionStoreState {
  visible: boolean;
  color:   Color;
  pending: PendingPromotion | null;
  /** Resolves with chosen piece type — set by the store, awaited by callers */
  resolve: ((piece: PieceType) => void) | null;
}

const INITIAL: PromotionStoreState = {
  visible: false,
  color:   'w',
  pending: null,
  resolve: null,
};

function createPromotionStore() {
  const { subscribe, set, update } = writable<PromotionStoreState>(INITIAL);

  return {
    subscribe,

    /**
     * Show the promotion dialog and return a promise that resolves
     * once the user picks a piece.
     */
    request(pending: PendingPromotion): Promise<PieceType> {
      return new Promise<PieceType>((resolvePromise) => {
        set({
          visible: true,
          color:   pending.color,
          pending,
          resolve: resolvePromise,
        });
      });
    },

    /** Called when the user clicks a promotion piece button. */
    resolve(piece: PieceType): void {
      update((s) => {
        s.resolve?.(piece);
        return { ...INITIAL };
      });
    },
  };
}

export const promotionState = createPromotionStore();
