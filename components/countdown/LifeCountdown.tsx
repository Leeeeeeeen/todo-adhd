'use client'

import { useEffect, useState } from 'react'
import { getGoalRemainingSeconds, getGoalProgressPercent, getGoalTargetDate } from '@/lib/countdown'
import { useStore } from '@/store/useStore'
import Link from 'next/link'

export default function LifeCountdown() {
  const { settings } = useStore()
  const [remaining, setRemaining] = useState(0)
  const [progress, setProgress] = useState(0)

  const { goalType, goalAge, goalDate, birthDate } = settings

  const targetDate = getGoalTargetDate(goalType, birthDate, goalAge, goalDate)
  const isConfigured = goalType === 'date' ? !!goalDate : !!birthDate

  useEffect(() => {
    if (!isConfigured) return
    const update = () => {
      setRemaining(getGoalRemainingSeconds(goalType, birthDate, goalAge, goalDate))
      setProgress(getGoalProgressPercent(goalType, birthDate, goalAge, goalDate))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [goalType, birthDate, goalAge, goalDate, isConfigured])

  if (!isConfigured) {
    return (
      <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">目標カウントダウン</h2>
          <p className="text-gray-500 text-sm">目標を設定してください</p>
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

  const totalDays = Math.floor(remaining / 86400)
  const remainHours = Math.floor((remaining % 86400) / 3600)
  const remainMinutes = Math.floor((remaining % 3600) / 60)
  const remainSeconds = remaining % 60

  const goalLabel =
    goalType === 'age'
      ? `${goalAge}歳まで`
      : targetDate
      ? targetDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) + 'まで'
      : '目標日まで'

  return (
    <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">目標カウントダウン</h2>
        <span className="text-xs text-gray-500">{progress}% 経過</span>
      </div>

      <div className="mb-1">
        <span className="text-3xl font-bold text-purple-400 font-mono tabular-nums">
          {totalDays.toLocaleString()}
        </span>
        <span className="text-gray-500 text-sm ml-2">日</span>
        <span className="text-xl font-bold text-purple-400 font-mono tabular-nums ml-3">
          {String(remainHours).padStart(2, '0')}:{String(remainMinutes).padStart(2, '0')}:{String(remainSeconds).padStart(2, '0')}
        </span>
      </div>

      <div className="text-gray-500 text-xs mb-4">{goalLabel}</div>

      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-purple-600 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>{goalType === 'age' && birthDate ? new Date(birthDate).getFullYear() + '年' : '現在'}</span>
        <span>{goalLabel}</span>
      </div>
    </div>
  )
}
