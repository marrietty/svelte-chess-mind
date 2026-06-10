import { createClient } from '@supabase/supabase-js';

// Access environment variables securely in Svelte/Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables! Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your .env file.'
  );
}

// Create and export the reusable Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
