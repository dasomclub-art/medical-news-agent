import { scrapeWHO } from './who';
import { scrapeCDC } from './cdc';
import { scrapeNIH } from './nih';
import { scrapePubMed } from './pubmed';
import { scrapeMedicalXpress } from './medicalxpress';
import { scrapeGoogleNews } from './google-news';
import { scrapeReuters } from './reuters';
import type { CollectionResult } from '../types';

export type ScraperKey =
  | 'WHO'
  | 'CDC'
  | 'NIH'
  | 'PubMed'
  | 'MedicalXpress'
  | 'Google News'
  | 'Reuters';

export const SCRAPERS: Record<ScraperKey, () => Promise<CollectionResult>> = {
  WHO: scrapeWHO,
  CDC: scrapeCDC,
  NIH: scrapeNIH,
  PubMed: scrapePubMed,
  MedicalXpress: scrapeMedicalXpress,
  'Google News': scrapeGoogleNews,
  Reuters: scrapeReuters,
};

export async function runAllScrapers(
  sources?: ScraperKey[]
): Promise<CollectionResult[]> {
  const keys = (sources || Object.keys(SCRAPERS)) as ScraperKey[];
  const results = await Promise.allSettled(
    keys.map((key) => SCRAPERS[key]())
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    return {
      source: keys[i],
      articles: [],
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
    };
  });
}
