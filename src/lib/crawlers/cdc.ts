import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 15000 })

export async function crawlCDC(): Promise<RawArticle[]> {
  const feeds = [
    'https://tools.cdc.gov/api/v2/resources/media/132608.rss',
    'https://tools.cdc.gov/api/v2/resources/media/404952.rss',
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
          source: 'CDC',
          source_icon: 'https://www.cdc.gov/favicon.ico',
          published_at: item.pubDate || item.isoDate || null,
          tags: ['CDC', 'Disease Control'],
          image_url: null,
        })
      }
    } catch (err) {
      console.error(`CDC feed error (${feedUrl}):`, err)
    }
  }

  return articles
}
