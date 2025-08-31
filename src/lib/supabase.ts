import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'faculty' | 'student'
  status: 'active' | 'pending' | 'rejected'
  created_at: string
  updated_at: string
}

export interface PendingApproval {
  id: string
  user_id: string
  full_name: string
  email: string
  requested_role: 'faculty'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  approved_by?: string
  approved_at?: string
}
