import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { summarizeArticle } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Reset stuck articles (summarized=true but no summary) back to pending
  await client
    .from('articles')
    .update({ is_summarized: false })
    .eq('is_summarized', true)
    .is('summary', null);

  // Fetch unsummarized articles with content
  const { data: unsummarized, error: fetchError } = await client
    .from('articles')
    .select('id, title, content, source')
    .eq('is_summarized', false)
    .limit(20);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!unsummarized || unsummarized.length === 0) {
    return NextResponse.json({ message: 'No articles to summarize', count: 0 });
  }

  const results: { id: string; title: string; status: string; error?: string }[] = [];

  for (const article of unsummarized) {
    try {
      const content = article.content || article.title;
      const result = await summarizeArticle(article.title, content);

      if (result.summary) {
        const { error: updateError } = await client
          .from('articles')
          .update({
            summary: result.summary,
            disease_keywords: result.keywords,
            is_summarized: true,
          })
          .eq('id', article.id);

        results.push({
          id: article.id,
          title: article.title.slice(0, 60),
          status: updateError ? `update_error: ${updateError.message}` : 'ok',
        });
      } else {
        await client.from('articles').update({ is_summarized: true }).eq('id', article.id);
        results.push({ id: article.id, title: article.title.slice(0, 60), status: 'empty_summary' });
      }
    } catch (err) {
      results.push({
        id: article.id,
        title: article.title.slice(0, 60),
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const ok = results.filter((r) => r.status === 'ok').length;
  return NextResponse.json({ processed: results.length, summarized: ok, results });
}
