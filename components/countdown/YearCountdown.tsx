'use client'

import { useEffect, useState } from 'react'
import {
  getYearRemainingSeconds,
  getYearProgressPercent,
  getWeekRemainingSeconds,
  getWeekProgressPercent,
} from '@/lib/countdown'

type Mode = 'year' | 'week'

const WEEK_DAYS = ['月', '火', '水', '木', '金', '土', '日']

function getWeekDayIndex(): number {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
}

export default function YearCountdown() {
  const [mode, setMode] = useState<Mode>('year')
  const [yearSeconds, setYearSeconds] = useState(0)
  const [yearProgress, setYearProgress] = useState(0)
  const [weekSeconds, setWeekSeconds] = useState(0)
  const [weekProgress, setWeekProgress] = useState(0)
  const [weekDayIdx, setWeekDayIdx] = useState(0)

  useEffect(() => {
    const update = () => {
      setYearSeconds(getYearRemainingSeconds())
      setYearProgress(getYearProgressPercent())
      setWeekSeconds(getWeekRemainingSeconds())
      setWeekProgress(getWeekProgressPercent())
      setWeekDayIdx(getWeekDayIndex())
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const year = new Date().getFullYear()

  // 年モード用
  const totalDays = Math.floor(yearSeconds / 86400)
  const remainHours = Math.floor((yearSeconds % 86400) / 3600)
  const remainMinutes = Math.floor((yearSeconds % 3600) / 60)

  // 週モード用
  const weekDays = Math.floor(weekSeconds / 86400)
  const weekRemainH = Math.floor((weekSeconds % 86400) / 3600)
  const weekRemainM = Math.floor((weekSeconds % 3600) / 60)

  const progress = mode === 'year' ? yearProgress : weekProgress

  return (
    <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {mode === 'year' ? `${year}年の残り時間` : '今週の残り時間'}
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
              年
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
              style={{ width: `${yearProgress}%` }}
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
            {weekDays}<span className="text-lg font-normal text-gray-500">日 </span>
            {String(weekRemainH).padStart(2, '0')}<span className="text-lg font-normal text-gray-500">時間 </span>
            {String(weekRemainM).padStart(2, '0')}<span className="text-lg font-normal text-gray-500">分</span>
          </div>

          <div className="flex gap-1.5 mt-4 mb-1">
            {WEEK_DAYS.map((day, idx) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full h-2 rounded-full transition-all duration-500 ${
                    idx < weekDayIdx
                      ? 'bg-amber-500'
                      : idx === weekDayIdx
                      ? 'bg-amber-500 opacity-50'
                      : 'bg-gray-700'
                  }`}
                />
                <span className={`text-[10px] ${idx === weekDayIdx ? 'text-gray-200 font-bold' : 'text-gray-600'}`}>
                  {day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>月曜</span>
            <span>残り {weekDays}日 {weekRemainH}時間</span>
            <span>日曜</span>
          </div>
        </>
      )}
    </div>
  )
}
