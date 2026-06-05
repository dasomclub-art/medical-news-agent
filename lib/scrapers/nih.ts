import Parser from 'rss-parser';
import type { Article, CollectionResult } from '../types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MedicalNewsAgent/1.0)',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
});

const NIH_FEEDS = [
  'https://newsinhealth.nih.gov/sites/nihNIH/files/rss.xml',
  'https://www.niaid.nih.gov/news-events/newsroom/rss',
  'https://www.cancer.gov/news-events/cancer-currents-blog/feed',
];

export async function scrapeNIH(): Promise<CollectionResult> {
  const source = 'NIH';
  const articles: Article[] = [];

  for (const feedUrl of NIH_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 10)) {
        const url = item.link || item.guid || '';
        if (!url || articles.some((a) => a.url === url)) continue;
        articles.push({
          title: item.title || '',
          url,
          source,
          source_url: 'https://www.nih.gov',
          author: item.creator || 'NIH',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
          content: item.contentSnippet || item.summary || '',
          tags: ['NIH', 'Research', 'Biomedical'],
        });
      }
      if (articles.length > 0) break;
    } catch {
      // try next feed
    }
  }

  if (articles.length === 0) {
    return { source, articles: [], error: 'All NIH RSS feeds failed' };
  }

  return { source, articles };
}
