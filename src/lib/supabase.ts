import { createClient } from '@supabase/supabase-js';

// Diese Werte müssen in den Projekt-Settings unter "Supabase" konfiguriert werden
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey;
};
