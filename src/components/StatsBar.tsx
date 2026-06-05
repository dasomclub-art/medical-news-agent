'use client'

import { Database, TrendingUp, Globe } from 'lucide-react'

interface StatsBarProps {
  total: number
  todayNew: number
  sourcesActive: number
}

export default function StatsBar({ total, todayNew, sourcesActive }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Database className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</div>
          <div className="text-xs text-gray-500">전체 기사</div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{todayNew}</div>
          <div className="text-xs text-gray-500">오늘 새 기사</div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{sourcesActive}</div>
          <div className="text-xs text-gray-500">수집 소스</div>
        </div>
      </div>
    </div>
  )
}
