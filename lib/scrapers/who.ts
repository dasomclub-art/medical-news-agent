import Parser from 'rss-parser';
import type { Article, CollectionResult } from '../types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MedicalNewsAgent/1.0)',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
});

export async function scrapeWHO(): Promise<CollectionResult> {
  const source = 'WHO';
  try {
    const feed = await parser.parseURL('https://www.who.int/rss-feeds/news-english.xml');
    const articles: Article[] = feed.items.slice(0, 20).map((item) => ({
      title: item.title || '',
      url: item.link || item.guid || '',
      source,
      source_url: 'https://www.who.int',
      author: item.creator || 'WHO',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
      content: item.contentSnippet || item.summary || '',
      tags: ['WHO', 'Global Health'],
    }));
    return { source, articles: articles.filter((a) => a.url) };
  } catch (error) {
    return {
      source,
      articles: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
