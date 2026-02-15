import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://txhemjcjlbwtlxoekpgf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aGVtamNqbGJ3dGx4b2VrcGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNDczOTgsImV4cCI6MjA4NjcyMzM5OH0.khOudLU_ehAM9893nD_vHhYQRdcvaUFS83_FCxkt4eM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)