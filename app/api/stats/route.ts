import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

export async function GET() {
  const [totalResult, sourceResult, recentResult, logsResult] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('source')
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        (data || []).forEach((r) => {
          counts[r.source] = (counts[r.source] || 0) + 1;
        });
        return counts;
      }),
    supabase
      .from('articles')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('collection_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(7),
  ]);

  return NextResponse.json({
    total: totalResult.count || 0,
    by_source: sourceResult,
    last_collected: recentResult.data?.[0]?.created_at || null,
    recent_logs: logsResult.data || [],
  });
}
