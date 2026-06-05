import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 15000 })

export async function crawlReuters(): Promise<RawArticle[]> {
  const feeds = [
    'https://feeds.reuters.com/reuters/healthNews',
    'https://news.google.com/rss/search?q=reuters+health+disease&hl=en-US&gl=US&ceid=US:en',
  ]

  const articles: RawArticle[] = []

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl)
      for (const item of feed.items.slice(0, 15)) {
        if (!item.title || !item.link) continue
        if (articles.some(a => a.url === item.link)) continue

        articles.push({
          title: item.title,
          content: item.contentSnippet || item.content || item.summary || '',
          url: item.link,
          source: 'Reuters Health',
          source_icon: 'https://www.reuters.com/favicon.ico',
          published_at: item.pubDate || item.isoDate || null,
          tags: ['Reuters', 'Health News'],
          image_url: null,
        })
      }
    } catch (err) {
      console.error(`Reuters feed error (${feedUrl}):`, err)
    }
  }

  return articles
}
