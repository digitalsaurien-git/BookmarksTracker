import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nacezhtshlurxxwajxwc.supabase.co'
const supabaseKey = 'sb_publishable_UcX7Xawdh-CdT8ET7z9dCg_mNVE-qyq'

export const supabase = createClient(supabaseUrl, supabaseKey)
