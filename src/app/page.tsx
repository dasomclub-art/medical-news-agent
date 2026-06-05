'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import SourceFilter from '@/components/SourceFilter'
import ArticleCard from '@/components/ArticleCard'
import StatsBar from '@/components/StatsBar'
import { Search, ChevronDown, AlertCircle } from 'lucide-react'
import type { Article } from '@/lib/supabase'

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [selectedSource, setSelectedSource] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCollecting, setIsCollecting] = useState(false)
  const [lastCollected, setLastCollected] = useState<string | null>(null)
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({})
  const [todayNew, setTodayNew] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [collectResult, setCollectResult] = useState<string | null>(null)

  const fetchArticles = useCallback(async (reset = false, targetPage?: number) => {
    const currentPage = targetPage ?? (reset ? 1 : page)
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: '24' })
      if (selectedSource !== 'all') params.set('source', selectedSource)
      if (search) params.set('q', search)

      const res = await fetch(`/api/articles?${params}`)
      if (!res.ok) throw new Error('Failed to fetch articles')
      const data = await res.json()

      setArticles(prev => (reset || currentPage === 1) ? data.articles : [...prev, ...data.articles])
      setTotal(data.total)
      setHasMore(data.hasMore)
      if (reset) setPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles')
    } finally {
      setIsLoading(false)
    }
  }, [page, selectedSource, search])

  const fetchStats = useCallback(async () => {
    try {
      const sources = ['WHO', 'CDC', 'NIH', 'PubMed', 'MedicalXpress', 'Google News', 'Reuters Health']
      const counts: Record<string, number> = {}
      await Promise.allSettled(
        sources.map(async (src) => {
          const r = await fetch(`/api/articles?source=${encodeURIComponent(src)}&limit=1`)
          if (r.ok) { const d = await r.json(); counts[src] = d.total || 0 }
        })
      )
      setSourceCounts(counts)

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const r = await fetch('/api/articles?limit=100')
      if (r.ok) {
        const d = await r.json()
        setTodayNew(d.articles.filter((a: Article) => new Date(a.created_at) >= todayStart).length)
      }
    } catch (err) { console.error('Stats error:', err) }
  }, [])

  useEffect(() => { fetchArticles(true) }, [selectedSource, search]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetchStats() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchArticles(false, nextPage)
  }

  const handleCollect = async () => {
    setIsCollecting(true)
    setCollectResult(null)
    try {
      const res = await fetch('/api/collect', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setCollectResult(`${data.total_new}개 새 기사 수집됨 (${data.duration})`)
        setLastCollected(new Date().toLocaleTimeString('ko-KR'))
        fetchStats()
        fetchArticles(true)
      } else {
        setCollectResult(`수집 오류: ${data.error}`)
      }
    } catch { setCollectResult('수집 요청 실패') } finally { setIsCollecting(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCollect={handleCollect} isCollecting={isCollecting} lastCollected={lastCollected} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {collectResult && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />{collectResult}
          </div>
        )}

        <StatsBar
          total={total}
          todayNew={todayNew}
          sourcesActive={Object.values(sourceCounts).filter(v => v > 0).length}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1) }} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder="기사 제목 또는 요약 검색..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">검색</button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchInput('') }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">초기화</button>
            )}
          </form>
          <SourceFilter selected={selectedSource} onChange={(s) => { setSelectedSource(s); setPage(1) }} counts={sourceCounts} />
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        {isLoading && articles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                <div className="h-5 bg-gray-200 rounded w-4/5 mb-4" />
                <div className="h-20 bg-blue-50 rounded-lg mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">기사가 없습니다</h3>
            <p className="text-gray-500">{search ? `"${search}" 검색 결과가 없습니다.` : '"지금 수집" 버튼을 눌러 뉴스를 가져오세요.'}</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">{search ? `"${search}" 검색: ` : ''}{total.toLocaleString()}개 기사</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
            </div>
            {hasMore && (
              <div className="text-center">
                <button onClick={handleLoadMore} disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-60">
                  <ChevronDown className={`w-4 h-4 ${isLoading ? 'animate-bounce' : ''}`} />더 보기
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
