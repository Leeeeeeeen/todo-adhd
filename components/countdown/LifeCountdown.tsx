'use client'

import { useEffect, useState } from 'react'
import { getLifeRemainingSeconds, getLifeProgressPercent, formatSeconds } from '@/lib/countdown'
import { useStore } from '@/store/useStore'
import Link from 'next/link'

export default function LifeCountdown() {
  const { settings } = useStore()
  const [remaining, setRemaining] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!settings.birthDate) return
    const update = () => {
      setRemaining(getLifeRemainingSeconds(settings.birthDate, settings.expectedLifespan))
      setProgress(getLifeProgressPercent(settings.birthDate, settings.expectedLifespan))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [settings.birthDate, settings.expectedLifespan])

  if (!settings.birthDate) {
    return (
      <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">人生の残り時間</h2>
          <p className="text-gray-500 text-sm">生年月日を設定してください</p>
        </div>
        <Link
          href="/settings"
          className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-700 rounded-lg px-3 py-1.5"
        >
          設定する
        </Link>
      </div>
    )
  }

  const { years, months } = formatSeconds(remaining)

  return (
    <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">人生の残り時間</h2>
        <span className="text-xs text-gray-500">{progress}% 経過</span>
      </div>

      <div className="mb-1">
        <span className="text-3xl font-bold text-purple-400 font-mono">
          {remaining.toLocaleString()}
        </span>
        <span className="text-gray-500 text-sm ml-2">秒</span>
      </div>
      <div className="text-gray-400 text-sm mb-4">
        あと <span className="text-white font-semibold">{years}年 {months}ヶ月</span>
      </div>

      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-purple-600 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>誕生</span>
        <span>{settings.expectedLifespan}歳まで</span>
      </div>
    </div>
  )
}
