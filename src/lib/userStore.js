import { writable } from 'svelte/store';
import { supabase } from './supabaseClient.js';

// The user store holds:
// - null: user is not logged in
// - { email, name, avatarUrl, id, raw }: user profile info when logged in
export const userStore = writable(null);

// Track if the initial session check has completed
export const authInitialized = writable(false);

// Listening to the authentication state changes
// This will fire automatically on load, login, logout, and session refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    const { email, user_metadata, id } = session.user;
    
    // Extract metadata values provided by Google OAuth
    const name = user_metadata?.full_name || user_metadata?.name || 'Chess Player';
    const avatarUrl = user_metadata?.avatar_url || user_metadata?.picture || '';

    userStore.set({
      id,
      email,
      name,
      avatarUrl,
      raw: session.user
    });
  } else {
    userStore.set(null);
  }
  authInitialized.set(true);
});

/**
 * Helper to trigger Google OAuth sign-in flow
 */
export async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirects back to the current domain (localhost in development, Vercel in production)
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    });
    if (error) throw error;
  } catch (err) {
    console.error('Error during Google sign-in:', err);
    throw err;
  }
}

/**
 * Helper to sign the user out of the active session
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    console.error('Error during sign-out:', err);
    throw err;
  }
}
