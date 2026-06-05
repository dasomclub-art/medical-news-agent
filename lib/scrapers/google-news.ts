import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import type { Article, CollectionResult } from '../types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MedicalNewsAgent/1.0)',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
});

const GOOGLE_NEWS_FEEDS = [
  'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=disease+outbreak+health&hl=en-US&gl=US&ceid=US:en',
];

function extractRealUrl(googleUrl: string): string {
  try {
    const url = new URL(googleUrl);
    const articleUrl = url.searchParams.get('url');
    return articleUrl || googleUrl;
  } catch {
    return googleUrl;
  }
}

function stripHtml(html: string): string {
  const $ = cheerio.load(html);
  return $('body').text().trim();
}

export async function scrapeGoogleNews(): Promise<CollectionResult> {
  const source = 'Google News';
  const articles: Article[] = [];
  const seenUrls = new Set<string>();

  for (const feedUrl of GOOGLE_NEWS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 15)) {
        const url = extractRealUrl(item.link || item.guid || '');
        if (!url || seenUrls.has(url)) continue;
        seenUrls.add(url);

        const content = item['content:encoded'] || item.contentSnippet || item.summary || '';

        articles.push({
          title: item.title || '',
          url,
          source,
          source_url: 'https://news.google.com',
          author: item.creator || 'Google News',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
          content: stripHtml(content),
          tags: ['Google News', 'Health News'],
        });
      }
    } catch {
      // try next feed
    }
  }

  return { source, articles };
}
