-- Medical News Agent Database Schema

CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  url TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  source_icon TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[],
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS collection_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  articles_collected INTEGER DEFAULT 0,
  articles_new INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS articles_source_idx ON articles(source);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS articles_created_at_idx ON articles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read logs" ON collection_logs FOR SELECT USING (true);

-- Allow service role to insert/update
CREATE POLICY "Service insert articles" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update articles" ON articles FOR UPDATE USING (true);
CREATE POLICY "Service insert logs" ON collection_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update logs" ON collection_logs FOR UPDATE USING (true);
