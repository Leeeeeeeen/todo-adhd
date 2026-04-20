'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Task } from '@/types'

interface Top3SectionProps {
  onOpenAddTask: () => void
}

export default function Top3Section({ onOpenAddTask }: Top3SectionProps) {
  const { tasks, setTop3, completeTask, startFocus } = useStore()
  const [showPicker, setShowPicker] = useState<(1 | 2 | 3) | null>(null)

  const top3 = [1, 2, 3].map((order) =>
    tasks.find((t) => t.isTop3 && t.top3Order === order && t.status !== 'done')
  )

  const availableTasks = tasks.filter(
    (t) => t.status !== 'done' && !t.isTop3
  )

  const handlePickTask = (task: Task, order: 1 | 2 | 3) => {
    setTop3(task.id, order)
    setShowPicker(null)
  }

  const handleRemove = (task: Task) => {
    setTop3(task.id, null)
  }

  return (
    <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          今日やる 3つ
        </h2>
        <span className="text-xs text-gray-500">
          {top3.filter(Boolean).length}/3 設定済み
        </span>
      </div>

      <div className="space-y-3">
        {([1, 2, 3] as const).map((order) => {
          const task = top3[order - 1]
          return (
            <div key={order} className="relative">
              {task ? (
                <motion.div
                  layout
                  className="flex items-center gap-3 bg-gray-700/50 border border-gray-600 rounded-xl p-3"
                >
                  <span className="text-indigo-400 font-bold text-sm w-6 text-center">
                    {order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{task.title}</p>
                    {task.reason && (
                      <p className="text-gray-500 text-xs truncate mt-0.5">💡 {task.reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        startFocus(task.id)
                        window.location.href = '/focus'
                      }}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-2.5 py-1 transition-colors"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => completeTask(task.id)}
                      className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg px-2.5 py-1 transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleRemove(task)}
                      className="text-xs text-gray-500 hover:text-red-400 rounded-lg px-1.5 py-1 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() =>
                    availableTasks.length > 0
                      ? setShowPicker(order)
                      : onOpenAddTask()
                  }
                  className="w-full flex items-center gap-3 border border-dashed border-gray-600 hover:border-indigo-500 rounded-xl p-3 transition-colors group"
                >
                  <span className="text-gray-600 group-hover:text-indigo-400 font-bold text-sm w-6 text-center transition-colors">
                    {order}
                  </span>
                  <span className="text-gray-600 group-hover:text-gray-400 text-sm transition-colors">
                    + タスクを選ぶ
                  </span>
                </button>
              )}

              {/* Task picker dropdown */}
              <AnimatePresence>
                {showPicker === order && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-20 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto"
                  >
                    {availableTasks.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        タスクがありません
                      </div>
                    ) : (
                      availableTasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handlePickTask(t, order)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          {t.title}
                        </button>
                      ))
                    )}
                    <button
                      onClick={() => setShowPicker(null)}
                      className="w-full text-center py-2 text-xs text-gray-500 hover:text-gray-400 border-t border-gray-700 transition-colors"
                    >
                      閉じる
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Click outside to close picker */}
      {showPicker && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowPicker(null)}
        />
      )}
    </div>
  )
}
