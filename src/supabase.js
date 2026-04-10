import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qsnezzijezlfsriwhgwc.supabase.co'
const supabaseKey = 'sb_publishable_fxnFB6UC6pULJlHyxQ6fUg_yK3tLpej'

export const supabase = createClient(supabaseUrl, supabaseKey)
