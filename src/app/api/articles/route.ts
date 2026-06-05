import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const source = searchParams.get('source')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('q')

  const offset = (page - 1) * limit
  const safeLimit = Math.max(limit, 1)

  let query = getSupabase()
    .from('articles')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + safeLimit - 1)

  if (source && source !== 'all') {
    query = query.eq('source', source)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    articles: data || [],
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
  })
}
