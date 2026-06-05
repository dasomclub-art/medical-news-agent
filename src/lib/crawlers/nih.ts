import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 15000 })

export async function crawlNIH(): Promise<RawArticle[]> {
  const feeds = [
    'https://www.nih.gov/news-events/news-releases/feed/rss.xml',
    'https://feeds.feedburner.com/nihnewsinhealth/NcmS',
  ]

  const articles: RawArticle[] = []

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl)
      for (const item of feed.items.slice(0, 15)) {
        if (!item.title || !item.link) continue
        articles.push({
          title: item.title,
          content: item.contentSnippet || item.content || item.summary || '',
          url: item.link,
          source: 'NIH',
          source_icon: 'https://www.nih.gov/favicon.ico',
          published_at: item.pubDate || item.isoDate || null,
          tags: ['NIH', 'Research'],
          image_url: null,
        })
      }
    } catch (err) {
      console.error(`NIH feed error (${feedUrl}):`, err)
    }
  }

  return articles
}
