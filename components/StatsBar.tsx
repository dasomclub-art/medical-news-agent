'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

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

const SOURCE_COLORS: Record<string, string> = {
  WHO: 'text-blue-400',
  CDC: 'text-red-400',
  NIH: 'text-purple-400',
  PubMed: 'text-emerald-400',
  MedicalXpress: 'text-orange-400',
  'Google News': 'text-sky-400',
  Reuters: 'text-amber-400',
};

export default function StatsBar({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-6 text-xs text-gray-500 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-24" />
          <div className="h-4 bg-gray-800 rounded w-32" />
          <div className="h-4 bg-gray-800 rounded w-28" />
        </div>
      </div>
    );
  }

  const lastCollected = stats.last_collected
    ? formatDistanceToNow(new Date(stats.last_collected), { addSuffix: true, locale: ko })
    : '없음';

  return (
    <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-gray-400">총 기사</span>
          <span className="text-white font-semibold">{stats.total.toLocaleString()}건</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">마지막 수집</span>
          <span className="text-gray-300">{lastCollected}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 flex-wrap">
          {Object.entries(stats.by_source).map(([src, count]) => (
            <span key={src} className="flex items-center gap-1">
              <span className={`font-medium ${SOURCE_COLORS[src] || 'text-gray-400'}`}>{src}</span>
              <span className="text-gray-500">{count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
