import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 15000 })

const SEARCH_TERMS = [
  'infectious disease outbreak',
  'emerging pathogen',
  'epidemic epidemiology',
]

export async function crawlPubMed(): Promise<RawArticle[]> {
  const articles: RawArticle[] = []

  for (const term of SEARCH_TERMS) {
    const encoded = encodeURIComponent(term)
    const feedUrl = `https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=${encoded}&limit=10&format=abstract`

    try {
      const feed = await parser.parseURL(feedUrl)
      for (const item of feed.items.slice(0, 10)) {
        if (!item.title || !item.link) continue
        // Avoid duplicates
        if (articles.some(a => a.url === item.link)) continue
        articles.push({
          title: item.title,
          content: item.contentSnippet || item.content || item.summary || '',
          url: item.link,
          source: 'PubMed',
          source_icon: 'https://pubmed.ncbi.nlm.nih.gov/favicon.ico',
          published_at: item.pubDate || item.isoDate || null,
          tags: ['PubMed', 'Research', 'Academic'],
          image_url: null,
        })
      }
    } catch (err) {
      console.error(`PubMed feed error (${term}):`, err)
    }
  }

  return articles
}
