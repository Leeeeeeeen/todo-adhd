'use client'

import { useMemo, useState } from 'react'
import { Calendar, momentLocalizer, Views, EventProps } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/ja'
import { useStore } from '@/store/useStore'
import { Task, CalendarTaskEvent } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import AddTaskModal from '@/components/todo/AddTaskModal'

moment.locale('ja')
const localizer = momentLocalizer(moment)

const priorityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#eab308',
  low: '#3b82f6',
}

function EventComponent({ event }: EventProps<CalendarTaskEvent>) {
  const task = event.resource
  return (
    <div
      className="flex items-center gap-1 px-1 rounded text-xs truncate h-full"
      style={{ borderLeft: `3px solid ${priorityColors[task.priority]}` }}
    >
      <span className={task.status === 'done' ? 'line-through opacity-50' : ''}>
        {task.title}
      </span>
    </div>
  )
}

export default function CalendarView() {
  const { tasks, completeTask, startFocus } = useStore()
  const [view, setView] = useState<'month' | 'week' | 'day'>(Views.MONTH)
  const [date, setDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [defaultDueDate, setDefaultDueDate] = useState<string | undefined>()

  const events = useMemo<CalendarTaskEvent[]>(() => {
    return tasks
      .filter((t) => t.dueDate)
      .map((t) => ({
        id: t.id,
        title: t.title,
        start: new Date(t.dueDate!),
        end: new Date(t.dueDate!),
        allDay: true,
        resource: t,
      }))
  }, [tasks])

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setDefaultDueDate(start.toISOString())
    setAddOpen(true)
  }

  const handleSelectEvent = (event: CalendarTaskEvent) => {
    setSelectedTask(event.resource)
  }

  const navigateLabel = () => {
    if (view === 'month') return moment(date).format('YYYY年M月')
    if (view === 'week') {
      const start = moment(date).startOf('week').format('M/D')
      const end = moment(date).endOf('week').format('M/D')
      return `${start} 〜 ${end}`
    }
    return moment(date).format('YYYY年M月D日')
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDate(moment(date).subtract(1, view === 'month' ? 'month' : view === 'week' ? 'week' : 'day').toDate())}
            className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            ‹
          </button>
          <span className="text-white font-medium text-sm min-w-36 text-center">{navigateLabel()}</span>
          <button
            onClick={() => setDate(moment(date).add(1, view === 'month' ? 'month' : view === 'week' ? 'week' : 'day').toDate())}
            className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            ›
          </button>
          <button
            onClick={() => setDate(new Date())}
            className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg px-2.5 py-1.5 transition-colors ml-1"
          >
            今日
          </button>
        </div>

        <div className="flex gap-1">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                view === v
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {v === 'month' ? '月' : v === 'week' ? '週' : '日'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden calendar-wrapper">
        <style>{`
          .rbc-calendar { background: transparent; color: #d1d5db; font-family: inherit; }
          .rbc-header { background: #1f2937; border-color: #374151 !important; padding: 8px 4px; font-size: 12px; color: #9ca3af; }
          .rbc-month-view, .rbc-time-view { border-color: #374151 !important; }
          .rbc-day-bg { border-color: #374151 !important; }
          .rbc-off-range-bg { background: #111827; }
          .rbc-today { background: #1e1b4b !important; }
          .rbc-date-cell { padding: 4px 8px; font-size: 12px; color: #9ca3af; }
          .rbc-date-cell.rbc-now { color: #818cf8; font-weight: bold; }
          .rbc-event { background: #1f2937; border: none; padding: 1px 4px; border-radius: 4px; }
          .rbc-event:focus { outline: none; }
          .rbc-event.rbc-selected { background: #312e81; }
          .rbc-show-more { color: #818cf8; font-size: 11px; background: transparent; }
          .rbc-toolbar { display: none; }
          .rbc-time-header { border-color: #374151 !important; background: #1f2937; }
          .rbc-time-content { border-color: #374151 !important; }
          .rbc-time-gutter .rbc-timeslot-group { border-color: #374151 !important; }
          .rbc-timeslot-group { border-color: #374151 !important; }
          .rbc-time-slot { font-size: 11px; color: #6b7280; }
          .rbc-current-time-indicator { background: #6366f1; }
          .rbc-month-row { border-color: #374151 !important; }
          .rbc-row-bg { border-color: #374151 !important; }
        `}</style>
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          date={date}
          onView={() => {}}
          onNavigate={() => {}}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          components={{ event: EventComponent }}
          style={{ height: 560 }}
          messages={{
            showMore: (count) => `+${count}件`,
            noEventsInRange: 'この期間のタスクはありません',
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        {[
          { color: '#ef4444', label: '優先度：高' },
          { color: '#eab308', label: '優先度：中' },
          { color: '#3b82f6', label: '優先度：低' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
        <span className="ml-auto text-gray-600">日付をクリックでタスク追加</span>
      </div>

      {/* Task detail popup */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-1 h-8 rounded-full mr-3 mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: priorityColors[selectedTask.priority] }}
                />
                <h3 className="text-white font-semibold flex-1">{selectedTask.title}</h3>
                <button onClick={() => setSelectedTask(null)} className="text-gray-500 hover:text-white ml-2">✕</button>
              </div>

              {selectedTask.reason && (
                <p className="text-gray-500 text-sm mb-4">💡 {selectedTask.reason}</p>
              )}

              <div className="flex gap-3 mt-4">
                {selectedTask.status !== 'done' && (
                  <>
                    <button
                      onClick={() => {
                        startFocus(selectedTask.id)
                        setSelectedTask(null)
                        window.location.href = '/focus'
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 text-sm font-medium transition-colors"
                    >
                      ▶ 開始
                    </button>
                    <button
                      onClick={() => {
                        completeTask(selectedTask.id)
                        setSelectedTask(null)
                      }}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl py-2 text-sm font-medium transition-colors"
                    >
                      ✓ 完了
                    </button>
                  </>
                )}
                {selectedTask.status === 'done' && (
                  <p className="text-emerald-400 text-sm text-center w-full">完了済み ✓</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddTaskModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setDefaultDueDate(undefined) }}
        defaultDueDate={defaultDueDate}
      />
    </div>
  )
}
