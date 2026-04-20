'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/store/useStore'
import UserMenu from '@/components/auth/UserMenu'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: '⏱' },
  { href: '/todos', label: 'タスク', icon: '☑' },
  { href: '/calendar', label: 'カレンダー', icon: '📅' },
  { href: '/focus', label: 'フォーカス', icon: '🎯' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { setQuickCaptureOpen, tasks } = useStore()
  useAuth() // 認証状態を初期化・監視

  const pendingCount = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress').length

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-white text-sm flex items-center gap-1.5">
          <span className="text-indigo-400">⏳</span>
          <span className="hidden sm:inline">ToDo ADHD</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 ml-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 hidden sm:inline">
              {pendingCount}件
            </span>
          )}
          <button
            onClick={() => setQuickCaptureOpen(true)}
            className="flex items-center gap-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-700/50 text-yellow-400 rounded-lg px-2.5 py-1.5 text-sm transition-colors"
            title="⌘⇧K"
          >
            <span>⚡</span>
            <span className="hidden sm:inline text-xs">メモ</span>
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
