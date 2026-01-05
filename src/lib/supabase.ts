import { createClient } from '@supabase/supabase-js';

// Tenta pegar as chaves do .env, se não existirem, usa string vazia para não quebrar o visual agora
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);