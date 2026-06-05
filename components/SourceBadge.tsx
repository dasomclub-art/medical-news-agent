'use client';

import { SOURCE_COLORS, type SourceKey } from '@/lib/types';

const colorMap: Record<string, string> = {
  WHO: 'bg-blue-600 text-white',
  CDC: 'bg-red-600 text-white',
  NIH: 'bg-purple-600 text-white',
  PubMed: 'bg-emerald-600 text-white',
  MedicalXpress: 'bg-orange-500 text-white',
  'Google News': 'bg-sky-500 text-white',
  Reuters: 'bg-amber-500 text-white',
};

export default function SourceBadge({ source }: { source: string }) {
  const cls = colorMap[source] || 'bg-gray-600 text-white';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {source}
    </span>
  );
}
