import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Variáveis ausentes. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env',
  )
  throw new Error(
    'Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env antes de iniciar a aplicacao.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)