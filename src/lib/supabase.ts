import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export interface Article {
  id: string
  title: string
  content: string | null
  summary: string | null
  url: string
  source: string
  source_icon: string | null
  published_at: string | null
  created_at: string
  tags: string[] | null
  image_url: string | null
}

export interface CollectionLog {
  id: string
  source: string
  articles_collected: number
  articles_new: number
  status: 'running' | 'success' | 'error'
  error_message: string | null
  started_at: string
  completed_at: string | null
}
