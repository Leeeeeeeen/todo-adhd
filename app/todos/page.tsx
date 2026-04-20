'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import TodoItem from '@/components/todo/TodoItem'
import AddTaskModal from '@/components/todo/AddTaskModal'
import { TaskStatus, Priority } from '@/types'

type FilterStatus = 'all' | TaskStatus
type FilterPriority = 'all' | Priority

export default function TodosPage() {
  const { tasks } = useStore()
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('todo')
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => filterStatus === 'all' || t.status === filterStatus)
      .filter((t) => filterPriority === 'all' || t.priority === filterPriority)
      .filter((t) =>
        search === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        // Top 3 first
        if (a.isTop3 && !b.isTop3) return -1
        if (!a.isTop3 && b.isTop3) return 1
        // Then by priority
        const pOrder = { high: 0, medium: 1, low: 2 }
        return pOrder[a.priority] - pOrder[b.priority]
      })
  }, [tasks, filterStatus, filterPriority, search])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">タスク一覧</h1>
        <button
          onClick={() => setAddTaskOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          + 追加
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="タスクを検索..."
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
      />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'todo', 'in_progress', 'done', 'skipped'] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filterStatus === s
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {s === 'all' ? 'すべて' : s === 'todo' ? '未着手' : s === 'in_progress' ? '進行中' : s === 'done' ? '完了' : 'スキップ'}
          </button>
        ))}
        <div className="w-px bg-gray-700 mx-1" />
        {(['all', 'high', 'medium', 'low'] as FilterPriority[]).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filterPriority === p
                ? p === 'all'
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : p === 'high'
                  ? 'bg-red-700 border-red-600 text-white'
                  : p === 'medium'
                  ? 'bg-yellow-700 border-yellow-600 text-white'
                  : 'bg-blue-700 border-blue-600 text-white'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {p === 'all' ? '全優先度' : p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3">✓</p>
            <p className="text-sm">タスクがありません</p>
            {filterStatus === 'todo' && (
              <button
                onClick={() => setAddTaskOpen(true)}
                className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                + タスクを追加する
              </button>
            )}
          </div>
        ) : (
          filtered.map((task) => (
            <TodoItem key={task.id} task={task} showTop3Badge={task.isTop3} />
          ))
        )}
      </div>

      <AddTaskModal open={addTaskOpen} onClose={() => setAddTaskOpen(false)} />
    </div>
  )
}
