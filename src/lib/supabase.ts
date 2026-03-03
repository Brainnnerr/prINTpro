import { createClient } from '@supabase/supabase-js';

// Accessing variables defined in .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!', { supabaseUrl, supabaseAnonKey });
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');