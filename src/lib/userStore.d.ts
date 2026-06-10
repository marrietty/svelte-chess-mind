import type { Writable } from 'svelte/store';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  raw: any;
}

export const userStore: Writable<UserSession | null>;
export const authInitialized: Writable<boolean>;

export function signInWithGoogle(): Promise<void>;
export function signOut(): Promise<void>;
