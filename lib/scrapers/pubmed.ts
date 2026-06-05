import type { Article, CollectionResult } from '../types';

const SEARCH_TERMS = [
  'infectious disease outbreak',
  'emerging pathogen',
  'vaccine efficacy',
  'pandemic preparedness',
  'antimicrobial resistance',
];

interface ESearchResult {
  esearchresult: {
    idlist: string[];
    count: string;
  };
}

interface ESummaryResult {
  result: {
    [key: string]: {
      uid: string;
      title: string;
      sortpubdate: string;
      authors: { name: string }[];
      source: string;
      fulljournalname: string;
      pubtype: string[];
    };
  };
}

async function fetchWithTimeout(url: string, timeout = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function scrapePubMed(): Promise<CollectionResult> {
  const source = 'PubMed';
  const articles: Article[] = [];
  const seenIds = new Set<string>();

  for (const term of SEARCH_TERMS.slice(0, 3)) {
    try {
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=5&sort=pub+date&datetype=pdat&reldate=30`;
      const searchRes = await fetchWithTimeout(searchUrl);
      if (!searchRes.ok) continue;

      const searchData = (await searchRes.json()) as ESearchResult;
      const ids = searchData.esearchresult?.idlist || [];
      if (!ids.length) continue;

      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
      const summaryRes = await fetchWithTimeout(summaryUrl);
      if (!summaryRes.ok) continue;

      const summaryData = (await summaryRes.json()) as ESummaryResult;

      for (const id of ids) {
        if (seenIds.has(id)) continue;
        seenIds.add(id);
        const item = summaryData.result?.[id];
        if (!item) continue;

        articles.push({
          title: item.title || '',
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          source,
          source_url: 'https://pubmed.ncbi.nlm.nih.gov',
          author: item.authors?.[0]?.name || 'Unknown',
          published_at: item.sortpubdate
            ? new Date(item.sortpubdate).toISOString()
            : undefined,
          content: `Published in: ${item.fulljournalname || item.source}`,
          tags: ['PubMed', 'Research', 'Peer-reviewed'],
        });
      }
    } catch {
      // skip failed term
    }
  }

  return { source, articles };
}
