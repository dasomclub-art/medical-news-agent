import { crawlWHO } from './who'
import { crawlCDC } from './cdc'
import { crawlNIH } from './nih'
import { crawlPubMed } from './pubmed'
import { crawlMedicalXpress } from './medicalxpress'
import { crawlGoogleNews } from './google-news'
import { crawlReuters } from './reuters'
import type { RawArticle } from './types'

export interface CrawlerResult {
  source: string
  articles: RawArticle[]
  error?: string
}

const crawlers: { name: string; fn: () => Promise<RawArticle[]> }[] = [
  { name: 'WHO', fn: crawlWHO },
  { name: 'CDC', fn: crawlCDC },
  { name: 'NIH', fn: crawlNIH },
  { name: 'PubMed', fn: crawlPubMed },
  { name: 'MedicalXpress', fn: crawlMedicalXpress },
  { name: 'Google News', fn: crawlGoogleNews },
  { name: 'Reuters Health', fn: crawlReuters },
]

export async function runAllCrawlers(): Promise<CrawlerResult[]> {
  const results = await Promise.allSettled(
    crawlers.map(async (crawler) => {
      const articles = await crawler.fn()
      return { source: crawler.name, articles }
    })
  )

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value
    }
    const error = result.reason instanceof Error ? result.reason.message : String(result.reason)
    console.error(`Crawler ${crawlers[i].name} failed:`, error)
    return { source: crawlers[i].name, articles: [], error }
  })
}

export type { RawArticle }
