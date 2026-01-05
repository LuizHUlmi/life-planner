import { createClient } from '@supabase/supabase-js';

// Busca as variáveis que definimos no .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cria a conexão única para ser usada no app todo
export const supabase = createClient(supabaseUrl, supabaseKey);