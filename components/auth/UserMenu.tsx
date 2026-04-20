'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function UserMenu() {
  const { currentUser, signOut, syncStatus, lastSyncedAt } = useStore()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!currentUser) {
    return (
      <Link
        href="/auth/login"
        className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg px-3 py-1.5 transition-colors"
      >
        ログイン
      </Link>
    )
  }

  const initials = (currentUser.name || currentUser.email || '?')[0].toUpperCase()
  const syncLabel =
    syncStatus === 'syncing'
      ? '同期中...'
      : syncStatus === 'error'
      ? '同期エラー'
      : lastSyncedAt
      ? `同期済み`
      : '未同期'

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity"
      >
        {currentUser.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
            {initials}
          </div>
        )}
        <div
          className={`w-2 h-2 rounded-full ${
            syncStatus === 'syncing'
              ? 'bg-yellow-400 animate-pulse'
              : syncStatus === 'error'
              ? 'bg-red-500'
              : 'bg-emerald-500'
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-sm font-medium text-white truncate">
                {currentUser.name || 'ユーザー'}
              </p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              <p className={`text-xs mt-1 ${
                syncStatus === 'error' ? 'text-red-400' : 'text-gray-600'
              }`}>
                ☁ {syncLabel}
              </p>
            </div>

            <div className="p-1">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span>⚙</span> 設定
              </Link>
              <button
                onClick={async () => {
                  setOpen(false)
                  await signOut()
                  router.push('/')
                  router.refresh()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span>↩</span> ログアウト
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
