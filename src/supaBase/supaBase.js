import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kgeuourhlnenxgahgxtb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZXVvdXJobG5lbnhnYWhneHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODYwNjYsImV4cCI6MjA3NjY2MjA2Nn0.71eyIG66nabfDSz2BvU1M1nesgOo8va3LhYmkDDS5tg'  // La "anon key"
export const supabase = createClient(supabaseUrl, supabaseKey)