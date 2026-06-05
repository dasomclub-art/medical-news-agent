'use client';

const SOURCES = ['all', 'WHO', 'CDC', 'NIH', 'PubMed', 'MedicalXpress', 'Google News', 'Reuters'];

const SOURCE_ACTIVE: Record<string, string> = {
  all: 'bg-gray-700 text-white border-gray-600',
  WHO: 'bg-blue-600 text-white border-blue-500',
  CDC: 'bg-red-600 text-white border-red-500',
  NIH: 'bg-purple-600 text-white border-purple-500',
  PubMed: 'bg-emerald-600 text-white border-emerald-500',
  MedicalXpress: 'bg-orange-500 text-white border-orange-400',
  'Google News': 'bg-sky-500 text-white border-sky-400',
  Reuters: 'bg-amber-500 text-white border-amber-400',
};

interface Props {
  activeSource: string;
  searchQuery: string;
  onSourceChange: (source: string) => void;
  onSearchChange: (q: string) => void;
}

export default function FilterBar({
  activeSource,
  searchQuery,
  onSourceChange,
  onSearchChange,
}: Props) {
  return (
    <div className="bg-gray-950 border-b border-gray-800 px-4 py-3 space-y-3">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="질병명, 키워드로 검색..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Source filter */}
        <div className="flex gap-2 flex-wrap">
          {SOURCES.map((src) => (
            <button
              key={src}
              onClick={() => onSourceChange(src)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                activeSource === src
                  ? SOURCE_ACTIVE[src]
                  : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-300'
              }`}
            >
              {src === 'all' ? '전체' : src}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
