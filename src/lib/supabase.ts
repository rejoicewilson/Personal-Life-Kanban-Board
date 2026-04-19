import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export async function ensureSupabaseSession() {
  if (!supabase) {
    throw new Error('Supabase environment variables are missing.')
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (session) {
    return session
  }

  const { data, error } = await supabase.auth.signInAnonymously()

  if (error) {
    throw error
  }

  if (!data.session) {
    throw new Error('Supabase anonymous sign-in did not return a session.')
  }

  return data.session
}

export async function getSupabaseUserId() {
  const session = await ensureSupabaseSession()
  return session.user.id
}
