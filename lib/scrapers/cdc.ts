import Parser from 'rss-parser';
import type { Article, CollectionResult } from '../types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MedicalNewsAgent/1.0)',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
});

const CDC_FEEDS = [
  'https://tools.cdc.gov/api/v2/resources/media/132608.rss',
  'https://www.cdc.gov/media/rss.xml',
];

export async function scrapeCDC(): Promise<CollectionResult> {
  const source = 'CDC';
  const articles: Article[] = [];

  for (const feedUrl of CDC_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 15)) {
        if (!item.link && !item.guid) continue;
        const url = item.link || item.guid || '';
        if (articles.some((a) => a.url === url)) continue;
        articles.push({
          title: item.title || '',
          url,
          source,
          source_url: 'https://www.cdc.gov',
          author: 'CDC',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
          content: item.contentSnippet || item.summary || '',
          tags: ['CDC', 'Public Health', 'United States'],
        });
      }
    } catch {
      // try next feed
    }
  }

  if (articles.length === 0) {
    return { source, articles: [], error: 'All CDC RSS feeds failed' };
  }

  return { source, articles };
}
