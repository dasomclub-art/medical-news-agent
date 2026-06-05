export interface Article {
  id?: string;
  title: string;
  url: string;
  source: string;
  source_url?: string;
  author?: string;
  published_at?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  disease_keywords?: string[];
  image_url?: string;
  is_summarized?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CollectionLog {
  id?: string;
  source: string;
  articles_collected: number;
  articles_new: number;
  status: 'running' | 'success' | 'error';
  error_message?: string;
  duration_ms?: number;
  created_at?: string;
}

export interface CollectionResult {
  source: string;
  articles: Article[];
  error?: string;
}

export type SourceKey =
  | 'WHO'
  | 'CDC'
  | 'NIH'
  | 'PubMed'
  | 'MedicalXpress'
  | 'Google News'
  | 'Reuters';

export const SOURCE_COLORS: Record<SourceKey, string> = {
  WHO: 'bg-blue-600',
  CDC: 'bg-red-600',
  NIH: 'bg-purple-600',
  PubMed: 'bg-green-600',
  MedicalXpress: 'bg-orange-600',
  'Google News': 'bg-sky-600',
  Reuters: 'bg-amber-600',
};

export const SOURCE_URLS: Record<SourceKey, string> = {
  WHO: 'https://www.who.int',
  CDC: 'https://www.cdc.gov',
  NIH: 'https://www.nih.gov',
  PubMed: 'https://pubmed.ncbi.nlm.nih.gov',
  MedicalXpress: 'https://medicalxpress.com',
  'Google News': 'https://news.google.com',
  Reuters: 'https://www.reuters.com',
};
