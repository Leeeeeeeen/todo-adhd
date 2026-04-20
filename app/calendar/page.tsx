'use client'

import dynamic from 'next/dynamic'

const CalendarView = dynamic(() => import('@/components/calendar/CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center">
      <div className="text-gray-500 text-sm">カレンダーを読み込み中...</div>
    </div>
  ),
})

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-4">カレンダー</h1>
      <CalendarView />
    </div>
  )
}
