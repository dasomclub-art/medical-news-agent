import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const source = searchParams.get('source');
  const search = searchParams.get('q');
  const clamped = Math.min(limit, 50);

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * clamped, page * clamped - 1);

  if (source && source !== 'all') {
    query = query.eq('source', source);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,summary.ilike.%${search}%,content.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    articles: data || [],
    total: count || 0,
    page,
    limit: clamped,
    total_pages: Math.ceil((count || 0) / clamped),
  });
}
