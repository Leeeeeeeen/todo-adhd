'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from '@/types'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'

const priorityColors = {
  high: 'bg-red-500/20 text-red-400 border-red-700',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-700',
  low: 'bg-blue-500/20 text-blue-400 border-blue-700',
}

const priorityLabels = {
  high: '高',
  medium: '中',
  low: '低',
}

const estimatedLabels: Record<number, string> = {
  5: '5分',
  15: '15分',
  30: '30分',
  60: '1時間',
  999: 'それ以上',
}

interface TodoItemProps {
  task: Task
  showTop3Badge?: boolean
}

export default function TodoItem({ task, showTop3Badge = false }: TodoItemProps) {
  const { completeTask, deleteTask, postponeTask, startFocus } = useStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [completed, setCompleted] = useState(false)
  const router = useRouter()

  const handleComplete = () => {
    setCompleted(true)
    setTimeout(() => {
      completeTask(task.id)
    }, 600)
  }

  const handleFocus = () => {
    startFocus(task.id)
    router.push('/focus')
  }

  const isWarning = task.postponeCount >= 3

  return (
    <AnimatePresence>
      {!completed && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 60, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`group relative bg-gray-800/60 border rounded-xl p-4 ${
            isWarning ? 'border-red-700/60' : 'border-gray-700'
          } hover:border-gray-600 transition-colors`}
        >
          {/* Warning badge */}
          {isWarning && (
            <div className="absolute -top-2 right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {task.postponeCount}回先延ばし中
            </div>
          )}

          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={handleComplete}
              className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-500 hover:border-emerald-400 transition-colors flex-shrink-0 flex items-center justify-center"
            >
              {completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 rounded-full bg-emerald-400"
                />
              )}
            </button>

            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-center gap-2 flex-wrap">
                {showTop3Badge && task.top3Order && (
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-900/50 border border-indigo-700 rounded px-1.5 py-0.5">
                    #{task.top3Order}
                  </span>
                )}
                <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
                  {task.title}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-xs border rounded px-1.5 py-0.5 ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </span>
                <span className="text-xs text-gray-500">
                  {estimatedLabels[task.estimatedMinutes] ?? task.estimatedMinutes + '分'}
                </span>
                {task.tags.map((tag) => (
                  <span key={tag} className="text-xs text-gray-500 bg-gray-700 rounded px-1.5 py-0.5">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Reason */}
              {task.reason && (
                <div className="mt-2 text-xs text-gray-500 italic">
                  💡 {task.reason}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleFocus}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-2.5 py-1.5 font-medium transition-colors"
              >
                ▶ 開始
              </button>
              <button
                onClick={() => postponeTask(task.id)}
                className="text-xs text-gray-400 hover:text-yellow-400 rounded-lg px-2 py-1.5 transition-colors"
                title="後回し"
              >
                ⏭
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="text-xs text-gray-400 hover:text-red-400 rounded-lg px-2 py-1.5 transition-colors"
                title="削除"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Delete confirm */}
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2"
              >
                <span className="text-sm text-gray-400 flex-1">このタスクを削除しますか？</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg px-3 py-1.5 transition-colors"
                >
                  削除
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-xs text-gray-400 hover:text-white rounded-lg px-3 py-1.5 transition-colors"
                >
                  キャンセル
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
