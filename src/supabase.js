import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://missing-url.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error("❌ ERREUR CRITIQUE: Configuration Supabase manquante ! Vérifiez que les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans Vercel.")
}

export const supabase = createClient(supabaseUrl, supabaseKey)
