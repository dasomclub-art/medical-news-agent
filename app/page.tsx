'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import FilterBar from '@/components/FilterBar';
import NewsCard from '@/components/NewsCard';
import type { Article } from '@/lib/types';

interface Stats {
  total: number;
  by_source: Record<string, number>;
  last_collected: string | null;
  recent_logs: {
    source: string;
    status: string;
    articles_new: number;
    created_at: string;
  }[];
}

interface NewsResponse {
  articles: Article[];
  total: number;
  total_pages: number;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollecting, setIsCollecting] = useState(false);
  const [activeSource, setActiveSource] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [collectMessage, setCollectMessage] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  const fetchNews = useCallback(
    async (p = 1, source = activeSource, q = searchQuery, append = false) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: '20',
          ...(source !== 'all' ? { source } : {}),
          ...(q ? { q } : {}),
        });
        const res = await fetch(`/api/news?${params}`);
        if (!res.ok) return;
        const data: NewsResponse = await res.json();
        setArticles((prev) => (append ? [...prev, ...data.articles] : data.articles));
        setTotal(data.total);
        setTotalPages(data.total_pages);
        setPage(p);
      } finally {
        setIsLoading(false);
      }
    },
    [activeSource, searchQuery]
  );

  useEffect(() => {
    fetchStats();
    fetchNews(1, 'all', '');
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchNews(1, activeSource, searchQuery);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleSourceChange = (source: string) => {
    setActiveSource(source);
    fetchNews(1, source, searchQuery);
  };

  const handleCollect = async () => {
    setIsCollecting(true);
    setCollectMessage(null);
    try {
      const res = await fetch('/api/collect', { method: 'POST', body: JSON.stringify({}) });
      if (res.ok) {
        const data = await res.json();
        setCollectMessage(`수집 완료! 새 기사 ${data.total_new}건`);
        await fetchStats();
        await fetchNews(1, activeSource, searchQuery);
      }
    } catch {
      setCollectMessage('수집 중 오류가 발생했습니다.');
    } finally {
      setIsCollecting(false);
      setTimeout(() => setCollectMessage(null), 5000);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchNews(page + 1, activeSource, searchQuery, true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header onCollect={handleCollect} isCollecting={isCollecting} />
      <StatsBar stats={stats} />
      <FilterBar
        activeSource={activeSource}
        searchQuery={searchQuery}
        onSourceChange={handleSourceChange}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {collectMessage && (
          <div className="mb-4 px-4 py-3 bg-blue-900/50 border border-blue-700 rounded-lg text-sm text-blue-300">
            {collectMessage}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {isLoading ? (
              <span className="animate-pulse">불러오는 중...</span>
            ) : (
              <>
                <span className="text-gray-300 font-medium">{total.toLocaleString()}</span>건의 기사
              </>
            )}
          </p>
          {total === 0 && !isLoading && (
            <button
              onClick={handleCollect}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              처음 수집 시작하기 →
            </button>
          )}
        </div>

        {!isLoading && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">
              {searchQuery ? `"${searchQuery}"에 대한 기사가 없습니다` : '수집된 기사가 없습니다'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCollect}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
              >
                지금 수집 시작
              </button>
            )}
          </div>
        )}

        {isLoading && articles.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-800 rounded w-20" />
                  <div className="h-4 bg-gray-800 rounded w-16" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-full" />
                  <div className="h-4 bg-gray-800 rounded w-4/5" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-gray-800 rounded w-full" />
                  <div className="h-3 bg-gray-800 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {articles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {articles.map((article) => (
              <NewsCard key={article.id || article.url} article={article} />
            ))}
          </div>
        )}

        {!isLoading && page < totalPages && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm rounded-lg border border-gray-700 transition-colors"
            >
              더 보기 ({page}/{totalPages})
            </button>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-gray-800 py-6 text-center text-xs text-gray-600">
        <p>Medical News Agent · WHO · CDC · NIH · PubMed · MedicalXpress · Google News · Reuters</p>
        <p className="mt-1">Powered by OpenRouter AI · Supabase · Vercel</p>
      </footer>
    </div>
  );
}
