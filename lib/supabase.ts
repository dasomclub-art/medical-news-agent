import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Supabase env vars are not set: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    _client = createClient(url, key);
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          url: string;
          source: string;
          source_url: string | null;
          author: string | null;
          published_at: string | null;
          content: string | null;
          summary: string | null;
          tags: string[];
          disease_keywords: string[];
          image_url: string | null;
          is_summarized: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      collection_logs: {
        Row: {
          id: string;
          source: string;
          articles_collected: number;
          articles_new: number;
          status: string;
          error_message: string | null;
          duration_ms: number | null;
          created_at: string;
        };
      };
    };
  };
};
