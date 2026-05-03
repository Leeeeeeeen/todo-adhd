'use client'

import { useEffect, useState } from 'react'
import {
  getDayRemainingSeconds,
  getDayProgressPercent,
  formatDayDisplay,
  getWeekRemainingSeconds,
  getWeekProgressPercent,
  getWeekDayLabel,
} from '@/lib/countdown'

type Mode = 'day' | 'week'

const WEEK_DAYS = ['月', '火', '水', '木', '金', '土', '日']

function getWeekDayIndex(): number {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1 // 月=0 … 日=6
}

export default function DayCountdown() {
  const [mode, setMode] = useState<Mode>('day')
  const [daySeconds, setDaySeconds] = useState(0)
  const [dayProgress, setDayProgress] = useState(0)
  const [weekSeconds, setWeekSeconds] = useState(0)
  const [weekProgress, setWeekProgress] = useState(0)
  const [weekDayIdx, setWeekDayIdx] = useState(0)

  useEffect(() => {
    const update = () => {
      setDaySeconds(getDayRemainingSeconds())
      setDayProgress(getDayProgressPercent())
      setWeekSeconds(getWeekRemainingSeconds())
      setWeekProgress(getWeekProgressPercent())
      setWeekDayIdx(getWeekDayIndex())
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const progress = mode === 'day' ? dayProgress : weekProgress

  const urgencyColor =
    progress >= 80
      ? 'text-red-400'
      : progress >= 60
      ? 'text-orange-400'
      : 'text-emerald-400'

  const barColor =
    progress >= 80
      ? 'bg-red-500'
      : progress >= 60
      ? 'bg-orange-500'
      : 'bg-emerald-500'

  // 週モードの残り表示
  const weekH = Math.floor(weekSeconds / 3600)
  const weekM = Math.floor((weekSeconds % 3600) / 60)
  const weekDays = Math.floor(weekSeconds / 86400)
  const weekRemainH = Math.floor((weekSeconds % 86400) / 3600)

  return (
    <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-6">
      {/* ヘッダー：タイトル＋切り替えボタン */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {mode === 'day' ? '今日の残り時間' : '今週の残り時間'}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{progress}% 経過</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-600 text-xs font-medium">
            <button
              onClick={() => setMode('day')}
              className={`px-2.5 py-1 transition-colors ${
                mode === 'day'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-gray-200'
              }`}
            >
              日
            </button>
            <button
              onClick={() => setMode('week')}
              className={`px-2.5 py-1 transition-colors ${
                mode === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-gray-200'
              }`}
            >
              週
            </button>
          </div>
        </div>
      </div>

      {/* カウントダウン表示 */}
      {mode === 'day' ? (
        <div className={`text-5xl font-mono font-bold tracking-tight mb-4 ${urgencyColor}`}>
          {formatDayDisplay(daySeconds)}
        </div>
      ) : (
        <div className={`text-5xl font-mono font-bold tracking-tight mb-4 ${urgencyColor}`}>
          {weekDays}
          <span className="text-2xl font-semibold ml-1 mr-3">日</span>
          {String(weekRemainH).padStart(2, '0')}
          <span className="text-2xl font-semibold ml-1">時間</span>
        </div>
      )}

      {/* プログレスバー */}
      {mode === 'day' ? (
        <>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
              style={{ width: `${dayProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>00:00</span>
            <span>残り {Math.floor(daySeconds / 3600)}時間 {Math.floor((daySeconds % 3600) / 60)}分</span>
            <span>23:59</span>
          </div>
        </>
      ) : (
        <>
          {/* 曜日ドット */}
          <div className="flex gap-1.5 mb-2">
            {WEEK_DAYS.map((day, idx) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full h-2 rounded-full transition-all duration-500 ${
                    idx < weekDayIdx
                      ? barColor
                      : idx === weekDayIdx
                      ? `${barColor} opacity-60`
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
