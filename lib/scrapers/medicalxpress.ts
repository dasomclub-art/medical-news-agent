import Parser from 'rss-parser';
import type { Article, CollectionResult } from '../types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MedicalNewsAgent/1.0)',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: ['media:thumbnail', 'enclosure'],
  },
});

export async function scrapeMedicalXpress(): Promise<CollectionResult> {
  const source = 'MedicalXpress';
  try {
    const feed = await parser.parseURL('https://medicalxpress.com/rss-feed/');
    const articles: Article[] = feed.items.slice(0, 20).map((item) => {
      const raw = item as unknown as Record<string, unknown>;
      const thumb =
        (raw['media:thumbnail'] as { $?: { url?: string } })?.$?.url ||
        (raw['enclosure'] as { url?: string })?.url ||
        undefined;

      return {
        title: item.title || '',
        url: item.link || item.guid || '',
        source,
        source_url: 'https://medicalxpress.com',
        author: item.creator || 'MedicalXpress',
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
        content: item.contentSnippet || item.summary || '',
        image_url: thumb,
        tags: ['MedicalXpress', 'Medical News'],
      };
    });
    return { source, articles: articles.filter((a) => a.url) };
  } catch (error) {
    return {
      source,
      articles: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
