import * as cheerio from 'cheerio';
import type { Article, CollectionResult } from '../types';

async function fetchWithTimeout(url: string, timeout = 9000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
      },
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function scrapeReuters(): Promise<CollectionResult> {
  const source = 'Reuters';
  const articles: Article[] = [];

  // Try Reuters health section
  const urls = [
    'https://www.reuters.com/business/healthcare-pharmaceuticals/',
    'https://www.reuters.com/science/',
  ];

  for (const pageUrl of urls) {
    try {
      const res = await fetchWithTimeout(pageUrl);
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      $('a[data-testid="Heading"]').each((_, el) => {
        const $el = $(el);
        const title = $el.text().trim();
        const href = $el.attr('href') || '';
        if (!title || !href) return;

        const url = href.startsWith('http') ? href : `https://www.reuters.com${href}`;
        if (articles.some((a) => a.url === url)) return;

        articles.push({
          title,
          url,
          source,
          source_url: 'https://www.reuters.com',
          author: 'Reuters',
          tags: ['Reuters', 'Health', 'Pharmaceuticals'],
        });
      });

      // fallback: general article links
      if (articles.length === 0) {
        $('article').each((_, el) => {
          const $el = $(el);
          const title = $el.find('h3, h2').first().text().trim();
          const href =
            $el.find('a').first().attr('href') || '';
          if (!title || !href) return;

          const url = href.startsWith('http')
            ? href
            : `https://www.reuters.com${href}`;
          if (articles.some((a) => a.url === url)) return;

          articles.push({
            title,
            url,
            source,
            source_url: 'https://www.reuters.com',
            author: 'Reuters',
            tags: ['Reuters', 'Health'],
          });
        });
      }

      if (articles.length >= 10) break;
    } catch {
      // try next url
    }
  }

  return { source, articles: articles.slice(0, 20) };
}
