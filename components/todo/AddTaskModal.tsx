'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Priority, EstimatedTime } from '@/types'

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
  defaultDueDate?: string
}

export default function AddTaskModal({ open, onClose, defaultDueDate }: AddTaskModalProps) {
  const { addTask } = useStore()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [estimatedMinutes, setEstimatedMinutes] = useState<EstimatedTime>(15)
  const [reason, setReason] = useState('')
  const [tags, setTags] = useState('')
  const [dueDate, setDueDate] = useState(() =>
    defaultDueDate ? new Date(defaultDueDate).toISOString().split('T')[0] : ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({
      title: title.trim(),
      priority,
      estimatedMinutes,
      status: 'todo',
      reason: reason.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
    setTitle('')
    setPriority('medium')
    setEstimatedMinutes(15)
    setReason('')
    setTags('')
    setDueDate('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-5">タスクを追加</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="何をやる？"
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Priority */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">優先度</label>
                  <div className="flex gap-2">
                    {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          priority === p
                            ? p === 'high'
                              ? 'bg-red-600 border-red-500 text-white'
                              : p === 'medium'
                              ? 'bg-yellow-600 border-yellow-500 text-white'
                              : 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated time */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">所要時間</label>
                  <select
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value) as EstimatedTime)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value={5}>5分</option>
                    <option value={15}>15分</option>
                    <option value={30}>30分</option>
                    <option value={60}>1時間</option>
                    <option value={999}>それ以上</option>
                  </select>
                </div>
              </div>

              <div>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="💡 なぜやるか？（任意）"
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="タグ（カンマ区切り）"
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">期日（カレンダーに表示）</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold transition-colors"
                >
                  追加する
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 text-gray-400 hover:text-white border border-gray-600 rounded-xl transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
