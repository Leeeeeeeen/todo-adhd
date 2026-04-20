'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CompletionAnimationProps {
  show: boolean
  onDone: () => void
}

const emojis = ['🎉', '✨', '🚀', '💪', '🎊', '⭐', '🌟']

export default function CompletionAnimation({ show, onDone }: CompletionAnimationProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; emoji: string }[]>([])

  useEffect(() => {
    if (!show) return
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }))
    setParticles(newParticles)
    const timer = setTimeout(onDone, 1500)
    return () => clearTimeout(timer)
  }, [show, onDone])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: '100vh', x: `${p.x}vw` }}
              animate={{ opacity: 0, y: '20vh' }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: Math.random() * 0.3 }}
              className="absolute text-3xl"
            >
              {p.emoji}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-emerald-600 text-white text-2xl font-bold rounded-2xl px-8 py-4 shadow-2xl">
              完了！ 🎉
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
