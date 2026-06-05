import Parser from 'rss-parser';
import type { Article, CollectionResult } from '../types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MedicalNewsAgent/1.0)',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
});

// Reuters blocks direct scraping; use Google News RSS to find Reuters health articles
const REUTERS_FEEDS = [
  'https://news.google.com/rss/search?q=site:reuters.com+health&hl=en&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=reuters+health+medicine&hl=en&gl=US&ceid=US:en',
];

export async function scrapeReuters(): Promise<CollectionResult> {
  const source = 'Reuters';
  const articles: Article[] = [];

  for (const feedUrl of REUTERS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 15)) {
        const url = item.link || item.guid || '';
        if (!url || articles.some((a) => a.url === url)) continue;
        // Only include items that are actually from reuters.com
        if (!url.includes('reuters.com') && !item.title?.toLowerCase().includes('reuters')) continue;
        articles.push({
          title: item.title || '',
          url,
          source,
          source_url: 'https://www.reuters.com',
          author: item.creator || 'Reuters',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
          content: item.contentSnippet || item.summary || '',
          tags: ['Reuters', 'Health'],
        });
      }
      if (articles.length >= 10) break;
    } catch {
      // try next feed
    }
  }

  if (articles.length === 0) {
    return { source, articles: [], error: 'No Reuters health articles found via RSS' };
  }

  return { source, articles: articles.slice(0, 20) };
}
