'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import SourceBadge from './SourceBadge';
import type { Article } from '@/lib/types';

interface Props {
  article: Article;
}

export default function NewsCard({ article }: Props) {
  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true, locale: ko })
    : article.created_at
    ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true, locale: ko })
    : null;

  return (
    <article className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 group">
      {article.image_url && (
        <div className="h-40 overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-center justify-between gap-2">
          <SourceBadge source={article.source} />
          {timeAgo && (
            <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo}</span>
          )}
        </div>

        <h2 className="text-sm font-semibold text-gray-100 leading-snug line-clamp-3 group-hover:text-blue-300 transition-colors">
          {article.title}
        </h2>

        {article.summary ? (
          <div className="flex-1">
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">
              {article.summary}
            </p>
          </div>
        ) : article.content ? (
          <div className="flex-1">
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 italic">
              {article.content.slice(0, 200)}
            </p>
          </div>
        ) : null}

        {article.disease_keywords && article.disease_keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.disease_keywords.slice(0, 4).map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 text-xs bg-blue-950 text-blue-300 border border-blue-800/50 rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          원문 보기
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </article>
  );
}
