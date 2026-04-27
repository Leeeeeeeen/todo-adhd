'use client'

import { useState } from 'react'
import DayCountdown from '@/components/countdown/DayCountdown'
import YearCountdown from '@/components/countdown/YearCountdown'
import LifeCountdown from '@/components/countdown/LifeCountdown'
import Top3Section from '@/components/todo/Top3Section'
import AddTaskModal from '@/components/todo/AddTaskModal'
import { useStore } from '@/store/useStore'

export default function Dashboard() {
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const { tasks, settings } = useStore()

  const todayDone = tasks.filter(
    (t) => t.status === 'done' && t.completedAt &&
    new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length

  const pendingCount = tasks.filter((t) => t.status === 'todo').length

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          {settings.name ? `こんにちは、${settings.name}さん` : 'ダッシュボード'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          今日の達成：<span className="text-emerald-400 font-semibold">{todayDone}件</span>
          　残り：<span className="text-yellow-400 font-semibold">{pendingCount}件</span>
        </p>
      </div>

      {/* Countdowns */}
      <div className="grid gap-4 md:grid-cols-2">
        <DayCountdown />
        <YearCountdown />
      </div>
      {settings.showLifeCountdown && (
        <LifeCountdown />
      )}

      {/* Today's 3 */}
      <Top3Section onOpenAddTask={() => setAddTaskOpen(true)} />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{todayDone}</div>
          <div className="text-xs text-gray-500 mt-1">今日完了</div>
        </div>
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{pendingCount}</div>
          <div className="text-xs text-gray-500 mt-1">残りタスク</div>
        </div>
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {tasks.filter((t) => t.isTop3 && t.status !== 'done').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">今日の3つ</div>
        </div>
      </div>

      {/* Add task CTA */}
      <button
        onClick={() => setAddTaskOpen(true)}
        className="w-full py-3 border border-dashed border-gray-700 hover:border-indigo-600 hover:bg-indigo-600/5 rounded-xl text-gray-500 hover:text-indigo-400 text-sm transition-colors"
      >
        + タスクを追加する
      </button>

      <AddTaskModal open={addTaskOpen} onClose={() => setAddTaskOpen(false)} />
    </div>
  )
}
