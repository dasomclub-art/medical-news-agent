import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
