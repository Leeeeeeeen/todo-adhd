'use client'

import { useEffect, useState } from 'react'
import { getDayRemainingSeconds, getDayProgressPercent, formatDayDisplay } from '@/lib/countdown'

export default function DayCountdown() {
  const [seconds, setSeconds] = useState(getDayRemainingSeconds())
  const [progress, setProgress] = useState(getDayProgressPercent())

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(getDayRemainingSeconds())
      setProgress(getDayProgressPercent())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const urgencyColor =
    progress >= 80
      ? 'text-red-400'
      : progress >= 60
      ? 'text-orange-400'
      : 'text-emerald-400'

  return (
    <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">今日の残り時間</h2>
        <span className="text-xs text-gray-500">{progress}% 経過</span>
      </div>

      <div className={`text-5xl font-mono font-bold tracking-tight mb-4 ${urgencyColor}`}>
        {formatDayDisplay(seconds)}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            progress >= 80
              ? 'bg-red-500'
              : progress >= 60
              ? 'bg-orange-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>00:00</span>
        <span>残り {Math.floor(seconds / 3600)}時間 {Math.floor((seconds % 3600) / 60)}分</span>
        <span>23:59</span>
      </div>
    </div>
  )
}
