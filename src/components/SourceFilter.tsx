'use client'

const SOURCES = [
  { id: 'all', label: '전체', color: 'bg-gray-700' },
  { id: 'WHO', label: 'WHO', color: 'bg-blue-600' },
  { id: 'CDC', label: 'CDC', color: 'bg-red-600' },
  { id: 'NIH', label: 'NIH', color: 'bg-purple-600' },
  { id: 'PubMed', label: 'PubMed', color: 'bg-indigo-600' },
  { id: 'MedicalXpress', label: 'MedicalXpress', color: 'bg-teal-600' },
  { id: 'Google News', label: 'Google', color: 'bg-orange-600' },
  { id: 'Reuters Health', label: 'Reuters', color: 'bg-orange-800' },
]

interface SourceFilterProps {
  selected: string
  onChange: (source: string) => void
  counts: Record<string, number>
}

export default function SourceFilter({ selected, onChange, counts }: SourceFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 py-3">
      {SOURCES.map((source) => {
        const count = source.id === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[source.id] || 0)

        return (
          <button
            key={source.id}
            onClick={() => onChange(source.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selected === source.id
                ? `${source.color} text-white shadow-md scale-105`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {source.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              selected === source.id ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
