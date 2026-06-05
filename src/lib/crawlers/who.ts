import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 15000 })

export async function crawlWHO(): Promise<RawArticle[]> {
  const feeds = [
    'https://www.who.int/rss-feeds/news-english.xml',
    'https://www.who.int/feeds/entity/csr/don/en/rss.xml',
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
          source: 'WHO',
          source_icon: 'https://www.who.int/favicon.ico',
          published_at: item.pubDate || item.isoDate || null,
          tags: ['WHO', 'Global Health'],
          image_url: null,
        })
      }
    } catch (err) {
      console.error(`WHO feed error (${feedUrl}):`, err)
    }
  }

  return articles
}
