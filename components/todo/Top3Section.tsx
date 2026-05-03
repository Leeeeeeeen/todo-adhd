'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Task } from '@/types'

interface Top3SectionProps {
  onOpenAddTask: () => void
}

export default function Top3Section({ onOpenAddTask }: Top3SectionProps) {
  const { tasks, addTask, setTop3, completeTask, startFocus } = useStore()
  const [inlineOrder, setInlineOrder] = useState<(1 | 2 | 3) | null>(null)
  const [inlineTitle, setInlineTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const top3 = [1, 2, 3].map((order) =>
    tasks.find((t) => t.isTop3 && t.top3Order === order && t.status !== 'done')
  )

  const top3Count = top3.filter(Boolean).length

  useEffect(() => {
    if (inlineOrder !== null) {
      inputRef.current?.focus()
    }
  }, [inlineOrder])

  const handleSlotClick = (order: 1 | 2 | 3) => {
    setInlineTitle('')
    setInlineOrder(order)
  }

  const handleInlineSubmit = (order: 1 | 2 | 3) => {
    const title = inlineTitle.trim()
    if (!title) {
      setInlineOrder(null)
      return
    }
    const newTask = addTask({
      title,
      priority: 'medium',
      estimatedMinutes: 15,
      status: 'todo',
      tags: [],
    })
    setTop3(newTask.id, order)
    setInlineTitle('')
    setInlineOrder(null)
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
          {top3Count}/3 設定済み
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
              ) : inlineOrder === order ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 border border-indigo-500 bg-gray-700/30 rounded-xl p-3"
                >
                  <span className="text-indigo-400 font-bold text-sm w-6 text-center">
                    {order}
                  </span>
                  <input
                    ref={inputRef}
                    value={inlineTitle}
                    onChange={(e) => setInlineTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleInlineSubmit(order)
                      if (e.key === 'Escape') setInlineOrder(null)
                    }}
                    onBlur={() => {
                      if (inlineTitle.trim()) {
                        handleInlineSubmit(order)
                      } else {
                        setInlineOrder(null)
                      }
                    }}
                    placeholder="タスク名を入力… (Enter で追加)"
                    className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleInlineSubmit(order)
                    }}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-2.5 py-1 transition-colors"
                  >
                    追加
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => handleSlotClick(order)}
                  className="w-full flex items-center gap-3 border border-dashed border-gray-600 hover:border-indigo-500 rounded-xl p-3 transition-colors group"
                >
                  <span className="text-gray-600 group-hover:text-indigo-400 font-bold text-sm w-6 text-center transition-colors">
                    {order}
                  </span>
                  <span className="text-gray-600 group-hover:text-gray-400 text-sm transition-colors">
                    + タップして追加
                  </span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* 3つ埋まっているときだけ下部ボタンを表示 */}
      {top3Count >= 3 && (
        <button
          onClick={onOpenAddTask}
          className="mt-4 w-full py-2.5 border border-dashed border-gray-700 hover:border-indigo-600 hover:bg-indigo-600/5 rounded-xl text-gray-500 hover:text-indigo-400 text-sm transition-colors"
        >
          + タスクを追加する
        </button>
      )}
    </div>
  )
}
