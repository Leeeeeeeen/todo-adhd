'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function FocusPage() {
  const { focusSession, tasks, endFocus, addInterruption, completeTask } = useStore()
  const [elapsed, setElapsed] = useState(0)
  const router = useRouter()

  const task = focusSession ? tasks.find((t) => t.id === focusSession.taskId) : null

  useEffect(() => {
    if (!focusSession) return
    const start = new Date(focusSession.startedAt).getTime()
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [focusSession])

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleEnd = () => {
    endFocus()
    router.push('/')
  }

  const handleComplete = () => {
    if (task) completeTask(task.id)
    endFocus()
    router.push('/')
  }

  if (!focusSession || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-6xl">🎯</div>
        <h1 className="text-xl font-bold text-white">フォーカスモード</h1>
        <p className="text-gray-500 text-sm text-center max-w-sm">
          タスクを選んで「▶ 開始」ボタンを押すと、フォーカスモードが始まります
        </p>
        <button
          onClick={() => router.push('/todos')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-3 font-medium transition-colors"
        >
          タスク一覧へ
        </button>
      </div>
    )
  }

  const progress = Math.min(100, (elapsed / (task.estimatedMinutes * 60)) * 100)

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      {/* Task name */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">フォーカス中</p>
        <h1 className="text-2xl font-bold text-white max-w-md">{task.title}</h1>
        {task.reason && (
          <p className="text-gray-500 text-sm mt-2">💡 {task.reason}</p>
        )}
      </div>

      {/* Timer */}
      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#1f2937" strokeWidth="12" />
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#6366f1"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            transition={{ duration: 1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-bold text-white">{formatElapsed(elapsed)}</span>
          <span className="text-gray-500 text-sm mt-1">
            目標 {task.estimatedMinutes === 999 ? '—' : task.estimatedMinutes + '分'}
          </span>
        </div>
      </div>

      {/* Interruptions */}
      <div className="flex items-center gap-6">
        <button
          onClick={addInterruption}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-yellow-400 transition-colors"
        >
          <span className="text-2xl">⚡</span>
          <span className="text-xs">中断 ({focusSession.interruptions})</span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleEnd}
          className="border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white rounded-xl px-6 py-3 font-medium transition-colors"
        >
          中断して戻る
        </button>
        <button
          onClick={handleComplete}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 py-3 font-medium transition-colors"
        >
          ✓ 完了！
        </button>
      </div>

      {/* 5-min mode hint */}
      <p className="text-gray-700 text-xs">
        集中できない時は「5分だけ」試してみよう
      </p>
    </div>
  )
}
