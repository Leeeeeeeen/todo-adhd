'use client'

import { useEffect, useState } from 'react'
import { getYearRemainingSeconds, getYearProgressPercent } from '@/lib/countdown'

type Mode = 'year' | 'week'

export default function YearCountdown() {
  const [mode, setMode] = useState<Mode>('year')
  const [seconds, setSeconds] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      setSeconds(getYearRemainingSeconds())
      setProgress(getYearProgressPercent())
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const year = new Date().getFullYear()

  const totalDays = Math.floor(seconds / 86400)
  const remainHours = Math.floor((seconds % 86400) / 3600)
  const remainMinutes = Math.floor((seconds % 3600) / 60)

  const remainWeeks = Math.floor(totalDays / 7)
  const remainWeekDays = totalDays % 7

  return (
    <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {year}年の残り時間
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{progress}% 経過</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-600 text-xs font-medium">
            <button
              onClick={() => setMode('year')}
              className={`px-2.5 py-1 transition-colors ${
                mode === 'year'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-gray-200'
              }`}
            >
              日
            </button>
            <button
              onClick={() => setMode('week')}
              className={`px-2.5 py-1 transition-colors ${
                mode === 'week'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-gray-200'
              }`}
            >
              週
            </button>
          </div>
        </div>
      </div>

      {mode === 'year' ? (
        <>
          <div className="text-3xl font-mono font-bold tracking-tight mb-1 text-amber-400">
            {totalDays}<span className="text-lg font-normal text-gray-500">日 </span>
            {String(remainHours).padStart(2, '0')}<span className="text-lg font-normal text-gray-500">時間 </span>
            {String(remainMinutes).padStart(2, '0')}<span className="text-lg font-normal text-gray-500">分</span>
          </div>

          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-4">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>1月1日</span>
            <span>12月31日</span>
          </div>
        </>
      ) : (
        <>
          <div className="text-3xl font-mono font-bold tracking-tight mb-1 text-amber-400">
            {remainWeeks}<span className="text-lg font-normal text-gray-500">週 </span>
            {remainWeekDays}<span className="text-lg font-normal text-gray-500">日</span>
          </div>

          <div className="text-gray-500 text-xs mb-4">12月31日まで（残り{totalDays}日）</div>

          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>1月1日</span>
            <span>12月31日</span>
          </div>
        </>
      )}
    </div>
  )
}
