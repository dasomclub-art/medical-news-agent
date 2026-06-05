import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 15000 })

export async function crawlMedicalXpress(): Promise<RawArticle[]> {
  const feeds = [
    'https://medicalxpress.com/rss-feed/',
    'https://medicalxpress.com/rss-feed/diseases-conditions/',
  ]

  const articles: RawArticle[] = []

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl)
      for (const item of feed.items.slice(0, 15)) {
        if (!item.title || !item.link) continue
        if (articles.some(a => a.url === item.link)) continue

        // Extract image from content if available
        let imageUrl: string | null = null
        const imgMatch = item['content:encoded']?.match(/<img[^>]+src="([^"]+)"/)
        if (imgMatch) imageUrl = imgMatch[1]

        articles.push({
          title: item.title,
          content: item.contentSnippet || item.content || item.summary || '',
          url: item.link,
          source: 'MedicalXpress',
          source_icon: 'https://medicalxpress.com/favicon.ico',
          published_at: item.pubDate || item.isoDate || null,
          tags: ['MedicalXpress', 'Medical News'],
          image_url: imageUrl,
        })
      }
    } catch (err) {
      console.error(`MedicalXpress feed error (${feedUrl}):`, err)
    }
  }

  return articles
}
