import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qsnezzijezlfsriwhgwc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbmV6emlqZXpsZnNyaXdoZ3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NDA4NjksImV4cCI6MjA2MDExNjg2OX0.2mjQi4AHEmvXlfMDzbjC3Ps4HqT1gmsk0ToXGTXwyMk'

export const supabase = createClient(supabaseUrl, supabaseKey)
