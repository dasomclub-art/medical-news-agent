import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runAllScrapers, type ScraperKey } from '@/lib/scrapers/index';
import { summarizeArticle } from '@/lib/openrouter';
import type { Article } from '@/lib/types';

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  // Only block external cron-style requests with wrong secret.
  // Browser UI requests (no Authorization header) are always allowed.
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (
    isVercelCron &&
    cronSecret &&
    cronSecret !== 'your_cron_secret_here' &&
    authHeader !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { sources?: ScraperKey[] } = {};
  try {
    body = await request.json();
  } catch {
    // no body
  }

  const startTime = Date.now();
  const results = await runAllScrapers(body.sources);

  const stats: Record<string, { collected: number; new: number; error?: string }> = {};
  let totalNew = 0;

  for (const result of results) {
    const logStart = Date.now();
    let newCount = 0;

    if (result.error) {
      stats[result.source] = { collected: 0, new: 0, error: result.error };
      await supabase.from('collection_logs').insert({
        source: result.source,
        articles_collected: 0,
        articles_new: 0,
        status: 'error',
        error_message: result.error,
        duration_ms: Date.now() - logStart,
      });
      continue;
    }

    const articlesToInsert: Omit<Article, 'id' | 'created_at' | 'updated_at'>[] =
      result.articles
        .filter((a) => a.title && a.url)
        .map((a) => ({
          title: a.title.slice(0, 500),
          url: a.url,
          source: a.source,
          source_url: a.source_url,
          author: a.author,
          published_at: a.published_at,
          content: a.content?.slice(0, 5000),
          summary: a.summary,
          tags: a.tags || [],
          disease_keywords: a.disease_keywords || [],
          image_url: a.image_url,
          is_summarized: false,
        }));

    if (articlesToInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('articles')
        .upsert(articlesToInsert, { onConflict: 'url', ignoreDuplicates: false })
        .select('id, url, is_summarized');

      if (insertError) {
        console.error(`[collect] Supabase upsert error for ${result.source}:`, insertError);
        stats[result.source] = { collected: result.articles.length, new: 0, error: insertError.message };
      }

      if (!insertError && inserted) {
        newCount = inserted.length;
        totalNew += newCount;
      }
    }

    stats[result.source] = {
      collected: result.articles.length,
      new: newCount,
    };

    await supabase.from('collection_logs').insert({
      source: result.source,
      articles_collected: result.articles.length,
      articles_new: newCount,
      status: 'success',
      duration_ms: Date.now() - logStart,
    });
  }

  // Background summarization: pick up to 10 unsummarized articles
  try {
    const { data: unsummarized } = await supabase
      .from('articles')
      .select('id, title, content')
      .eq('is_summarized', false)
      .not('content', 'is', null)
      .limit(10);

    if (unsummarized && unsummarized.length > 0) {
      await Promise.allSettled(
        unsummarized.map(async (article) => {
          try {
            const result = await summarizeArticle(article.title, article.content || '');
            if (result.summary) {
              await supabase
                .from('articles')
                .update({
                  summary: result.summary,
                  disease_keywords: result.keywords,
                  is_summarized: true,
                })
                .eq('id', article.id);
            } else {
              await supabase
                .from('articles')
                .update({ is_summarized: true })
                .eq('id', article.id);
            }
          } catch {
            // summarization failed, mark as done to avoid retries
            await supabase
              .from('articles')
              .update({ is_summarized: true })
              .eq('id', article.id);
          }
        })
      );
    }
  } catch {
    // summarization errors shouldn't fail the collection response
  }

  return NextResponse.json({
    success: true,
    duration_ms: Date.now() - startTime,
    total_new: totalNew,
    stats,
  });
}
