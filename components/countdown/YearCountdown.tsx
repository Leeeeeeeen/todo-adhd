'use client'

import { useEffect, useState } from 'react'
import { getYearRemainingSeconds, getYearProgressPercent } from '@/lib/countdown'

export default function YearCountdown() {
  const [seconds, setSeconds] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setSeconds(getYearRemainingSeconds())
    setProgress(getYearProgressPercent())
    const timer = setInterval(() => {
      setSeconds(getYearRemainingSeconds())
      setProgress(getYearProgressPercent())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const totalDays = Math.floor(seconds / 86400)
  const remainHours = Math.floor((seconds % 86400) / 3600)
  const remainMinutes = Math.floor((seconds % 3600) / 60)
  const year = new Date().getFullYear()

  return (
    <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{year}年の残り時間</h2>
        <span className="text-xs text-gray-500">{progress}% 経過</span>
      </div>

      <div className="text-3xl font-mono font-bold tracking-tight mb-1 text-amber-400">
        {totalDays}<span className="text-lg font-normal text-gray-500">日 </span>
        {String(remainHours).padStart(2, '0')}<span className="text-lg font-normal text-gray-500">時間 </span>
        {String(remainMinutes).padStart(2, '0')}<span className="text-lg font-normal text-gray-500">分</span>
      </div>

      {/* Progress bar */}
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
    </div>
  )
}
