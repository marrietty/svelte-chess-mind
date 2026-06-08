import { writable } from 'svelte/store';
import type { GameMode, GameOverState } from '$lib/types';

const INITIAL: GameOverState = {
  visible:  false,
  icon:     '♛',
  title:    '',
  subtitle: '',
  mode:     'ai',
};

function createGameOverStore() {
  const { subscribe, set, update } = writable<GameOverState>(INITIAL);

  return {
    subscribe,

    show(icon: string, title: string, subtitle: string, mode: GameMode): void {
      set({ visible: true, icon, title, subtitle, mode });
    },

    hide(): void {
      update((s) => ({ ...s, visible: false }));
    },
  };
}

export const gameOverState = createGameOverStore();
