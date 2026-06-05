'use client'

import { ExternalLink, Clock, Tag } from 'lucide-react'
import type { Article } from '@/lib/supabase'

const SOURCE_COLORS: Record<string, string> = {
  'WHO': 'bg-blue-100 text-blue-800',
  'CDC': 'bg-red-100 text-red-800',
  'NIH': 'bg-purple-100 text-purple-800',
  'PubMed': 'bg-indigo-100 text-indigo-800',
  'MedicalXpress': 'bg-teal-100 text-teal-800',
  'Google News': 'bg-orange-100 text-orange-800',
  'Reuters Health': 'bg-amber-100 text-amber-800',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '날짜 없음'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '날짜 없음'
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const colorClass = SOURCE_COLORS[article.source] || 'bg-gray-100 text-gray-800'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {article.image_url && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${colorClass}`}>
            {article.source}
          </span>
          <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0">
            <Clock className="w-3 h-3" />
            <span>{formatDate(article.published_at || article.created_at)}</span>
          </div>
        </div>

        <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
          {article.title}
        </h2>

        {article.summary ? (
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-blue-900 leading-relaxed line-clamp-4">
              {article.summary}
            </p>
          </div>
        ) : article.content ? (
          <p className="text-sm text-gray-500 line-clamp-3 mb-3">
            {article.content}
          </p>
        ) : null}

        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-3">
            <Tag className="w-3 h-3 text-gray-400" />
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          원문 읽기
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}
