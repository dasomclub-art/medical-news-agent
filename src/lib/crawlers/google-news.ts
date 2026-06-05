import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 15000 })

const HEALTH_TOPICS = [
  { url: 'https://news.google.com/rss/search?q=disease+outbreak&hl=en-US&gl=US&ceid=US:en', tag: 'Outbreak' },
  { url: 'https://news.google.com/rss/search?q=pandemic+epidemic+health&hl=en-US&gl=US&ceid=US:en', tag: 'Pandemic' },
  { url: 'https://news.google.com/rss/topics/CAAqIggKIhxDQkFTRHdvSkwyMHZNR1ptY1hRek1HRUtBUEFCUAA?hl=en-US&gl=US&ceid=US:en', tag: 'Health' },
]

export async function crawlGoogleNews(): Promise<RawArticle[]> {
  const articles: RawArticle[] = []

  for (const topic of HEALTH_TOPICS) {
    try {
      const feed = await parser.parseURL(topic.url)
      for (const item of feed.items.slice(0, 10)) {
        if (!item.title || !item.link) continue
        if (articles.some(a => a.url === item.link)) continue

        // Google News URLs wrap actual article URLs
        articles.push({
          title: item.title,
          content: item.contentSnippet || item.content || item.summary || '',
          url: item.link,
          source: 'Google News',
          source_icon: 'https://news.google.com/favicon.ico',
          published_at: item.pubDate || item.isoDate || null,
          tags: ['Google News', topic.tag],
          image_url: null,
        })
      }
    } catch (err) {
      console.error(`Google News feed error (${topic.tag}):`, err)
    }
  }

  return articles
}
