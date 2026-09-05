import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env.local and fill in your project credentials ' +
    '(or set them as environment variables in your Vercel project settings).'
  )
}

// IMPORTANT: createClient() throws synchronously if given an invalid/empty
// URL, which would crash the whole app before React can even render the
// "not configured" screen — leaving just a blank page with the CSS
// background showing. A harmless placeholder URL avoids that crash; no
// requests are ever made with it because every call site checks
// isSupabaseConfigured first.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
)
