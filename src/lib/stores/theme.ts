import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';
export type BoardTheme = 'wood' | 'blue' | 'forest';

export const themeStore = writable<Theme>('dark');
export const boardThemeStore = writable<BoardTheme>('wood');
export const showCaptureGuide = writable<boolean>(true);

if (typeof window !== 'undefined') {
  // Load global theme
  const savedTheme = localStorage.getItem('chessmind-theme') as Theme;
  if (savedTheme === 'light' || savedTheme === 'dark') {
    themeStore.set(savedTheme);
  }

  // Load board theme
  const savedBoardTheme = localStorage.getItem('chessmind-board-theme') as BoardTheme;
  if (savedBoardTheme === 'wood' || savedBoardTheme === 'blue' || savedBoardTheme === 'forest') {
    boardThemeStore.set(savedBoardTheme);
  }

  // Load capture guide
  const savedCaptureGuide = localStorage.getItem('chessmind-capture-guide');
  if (savedCaptureGuide !== null) {
    showCaptureGuide.set(savedCaptureGuide === 'true');
  }
}

export function toggleTheme() {
  themeStore.update((t) => {
    const next: Theme = t === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('chessmind-theme', next);
    }
    return next;
  });
}

export function setBoardTheme(bt: BoardTheme) {
  boardThemeStore.set(bt);
  if (typeof window !== 'undefined') {
    localStorage.setItem('chessmind-board-theme', bt);
  }
}

export function toggleCaptureGuide() {
  showCaptureGuide.update((v) => {
    const next = !v;
    if (typeof window !== 'undefined') {
      localStorage.setItem('chessmind-capture-guide', String(next));
    }
    return next;
  });
}
