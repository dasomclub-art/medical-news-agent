import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { runAllCrawlers } from '@/lib/crawlers'
import { summarizeArticle } from '@/lib/openrouter'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'

  if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results: { source: string; collected: number; new: number; error?: string }[] = []

  try {
    const crawlerResults = await runAllCrawlers()

    for (const result of crawlerResults) {
      const logEntry = await getSupabaseAdmin()
        .from('collection_logs')
        .insert({
          source: result.source,
          articles_collected: result.articles.length,
          articles_new: 0,
          status: result.error ? 'error' : 'running',
          error_message: result.error || null,
        })
        .select('id')
        .single()

      if (result.error || result.articles.length === 0) {
        results.push({ source: result.source, collected: 0, new: 0, error: result.error })
        continue
      }

      let newCount = 0

      // Process articles in batches of 5 to avoid rate limits
      for (let i = 0; i < result.articles.length; i += 5) {
        const batch = result.articles.slice(i, i + 5)

        await Promise.allSettled(
          batch.map(async (article) => {
            // Check if article already exists
            const db = getSupabaseAdmin()
            const { data: existing } = await db
              .from('articles')
              .select('id')
              .eq('url', article.url)
              .single()

            if (existing) return

            // Generate summary with AI
            let summary: string | null = null
            try {
              const contentForSummary = article.content || article.title
              if (contentForSummary.length > 50) {
                summary = await summarizeArticle(article.title, contentForSummary)
              }
            } catch (err) {
              console.error(`Summary error for ${article.url}:`, err)
            }

            const { error: insertError } = await db.from('articles').insert({
              title: article.title,
              content: article.content,
              summary,
              url: article.url,
              source: article.source,
              source_icon: article.source_icon,
              published_at: article.published_at,
              tags: article.tags,
              image_url: article.image_url,
            })

            if (!insertError) newCount++
          })
        )
      }

      // Update log with final counts
      if (logEntry.data?.id) {
        await getSupabaseAdmin()
          .from('collection_logs')
          .update({
            articles_new: newCount,
            status: 'success',
            completed_at: new Date().toISOString(),
          })
          .eq('id', logEntry.data.id)
      }

      results.push({ source: result.source, collected: result.articles.length, new: newCount })
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    return NextResponse.json({
      success: true,
      duration: `${duration}s`,
      results,
      total_new: results.reduce((sum, r) => sum + r.new, 0),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Collection error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Vercel Cron
export async function GET(req: NextRequest) {
  return POST(req)
}
