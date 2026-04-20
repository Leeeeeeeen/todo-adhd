'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'

export default function QuickCapture() {
  const { quickCaptureOpen, setQuickCaptureOpen, addTask } = useStore()
  const [text, setText] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'k') {
        e.preventDefault()
        setQuickCaptureOpen(true)
      }
      if (e.key === 'Escape') setQuickCaptureOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setQuickCaptureOpen])

  const handleCapture = () => {
    if (!text.trim()) return
    addTask({
      title: text.trim(),
      priority: 'medium',
      estimatedMinutes: 15,
      status: 'todo',
      tags: ['inbox'],
    })
    setText('')
    setQuickCaptureOpen(false)
  }

  return (
    <AnimatePresence>
      {quickCaptureOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/70 backdrop-blur-sm"
          onClick={() => setQuickCaptureOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            className="bg-gray-800 border border-gray-600 rounded-2xl p-4 w-full max-w-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-yellow-400 text-lg">⚡</span>
              <span className="text-sm text-gray-400">クイックキャプチャ</span>
              <span className="ml-auto text-xs text-gray-600">⌘⇧K</span>
            </div>
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
              placeholder="思いついたことを書いて Enter..."
              className="w-full bg-transparent text-white text-xl placeholder-gray-600 focus:outline-none py-2"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
              <span className="text-xs text-gray-600">Inboxに追加されます</span>
              <button
                onClick={handleCapture}
                disabled={!text.trim()}
                className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 text-black font-semibold rounded-lg px-4 py-1.5 text-sm transition-colors"
              >
                キャプチャ
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
