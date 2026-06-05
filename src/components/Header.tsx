'use client'

import { useState } from 'react'
import { Activity, RefreshCw } from 'lucide-react'

interface HeaderProps {
  onCollect: () => void
  isCollecting: boolean
  lastCollected: string | null
}

export default function Header({ onCollect, isCollecting, lastCollected }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-200" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">의료 뉴스 에이전트</h1>
            <p className="text-blue-200 text-sm">WHO · CDC · NIH · PubMed · MedicalXpress · Google News · Reuters</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastCollected && (
            <span className="text-blue-200 text-xs hidden sm:block">
              마지막 수집: {lastCollected}
            </span>
          )}
          <button
            onClick={onCollect}
            disabled={isCollecting}
            className="flex items-center gap-2 bg-white text-blue-800 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isCollecting ? 'animate-spin' : ''}`} />
            {isCollecting ? '수집 중...' : '지금 수집'}
          </button>
        </div>
      </div>
    </header>
  )
}
