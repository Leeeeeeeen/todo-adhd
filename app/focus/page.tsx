'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { PomodoroSettings } from '@/types'

type Phase = 'work' | 'short_break' | 'long_break'

const PHASE_COLOR: Record<Phase, string> = {
  work: '#6366f1',
  short_break: '#10b981',
  long_break: '#3b82f6',
}

const PHASE_TEXT_CLASS: Record<Phase, string> = {
  work: 'text-indigo-400',
  short_break: 'text-emerald-400',
  long_break: 'text-blue-400',
}

const PHASE_BTN_CLASS: Record<Phase, string> = {
  work: 'bg-indigo-600 hover:bg-indigo-500',
  short_break: 'bg-emerald-600 hover:bg-emerald-500',
  long_break: 'bg-blue-600 hover:bg-blue-500',
}

const PHASE_BADGE_CLASS: Record<Phase, string> = {
  work: 'bg-indigo-600/20 border-indigo-500 text-indigo-300',
  short_break: 'bg-emerald-600/20 border-emerald-500 text-emerald-300',
  long_break: 'bg-blue-600/20 border-blue-500 text-blue-300',
}

const PHASE_LABEL: Record<Phase, string> = {
  work: '🍅 作業',
  short_break: '☕ 小休憩',
  long_break: '🌿 長休憩',
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 660
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    osc.start()
    osc.stop(ctx.currentTime + 1.2)
  } catch {
    // AudioContext not available
  }
}

function getDuration(phase: Phase, settings: PomodoroSettings): number {
  if (phase === 'work') return settings.workMinutes * 60
  if (phase === 'short_break') return settings.shortBreakMinutes * 60
  return settings.longBreakMinutes * 60
}

export default function FocusPage() {
  const { focusSession, tasks, endFocus, addInterruption, completeTask, pomodoroSettings, updatePomodoroSettings } =
    useStore()
  const router = useRouter()
  const task = focusSession ? tasks.find((t) => t.id === focusSession.taskId) : null

  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState<Phase>('work')
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [totalPomodoros, setTotalPomodoros] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60) // SSR-safe default
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Sync with persisted settings after hydration
  useEffect(() => {
    setMounted(true)
    setSecondsLeft(pomodoroSettings.workMinutes * 60)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refs to avoid stale closures
  const phaseRef = useRef(phase)
  const pomodoroCountRef = useRef(pomodoroCount)
  const pomodoroSettingsRef = useRef(pomodoroSettings)
  const justReachedZeroRef = useRef(false)
  // Keep a ref to latest advance logic so the interval can always call up-to-date code
  const advanceRef = useRef<() => void>(() => {})

  phaseRef.current = phase
  pomodoroCountRef.current = pomodoroCount
  pomodoroSettingsRef.current = pomodoroSettings

  advanceRef.current = () => {
    playBeep()
    const p = phaseRef.current
    const count = pomodoroCountRef.current
    const s = pomodoroSettingsRef.current

    if (p === 'work') {
      const nextCount = count + 1
      setPomodoroCount(nextCount)
      setTotalPomodoros((t) => t + 1)
      const isLong = nextCount % s.longBreakInterval === 0
      const nextPhase: Phase = isLong ? 'long_break' : 'short_break'
      setPhase(nextPhase)
      setSecondsLeft(isLong ? s.longBreakMinutes * 60 : s.shortBreakMinutes * 60)
      setIsRunning(s.autoStartBreaks)
    } else {
      setPhase('work')
      setSecondsLeft(s.workMinutes * 60)
      setIsRunning(s.autoStartWork)
    }
  }

  // Countdown ticker
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          justReachedZeroRef.current = true
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning])

  // Phase transition: fires when timer reaches 0
  useEffect(() => {
    if (!justReachedZeroRef.current) return
    justReachedZeroRef.current = false
    setIsRunning(false)
    advanceRef.current()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  const totalSeconds = getDuration(phase, pomodoroSettings)
  const progress = Math.max(0, Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100))
  const circumference = 2 * Math.PI * 88

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleSkip = () => {
    setIsRunning(false)
    advanceRef.current()
  }

  const handleReset = () => {
    setIsRunning(false)
    setSecondsLeft(getDuration(phase, pomodoroSettings))
  }

  const cyclePos = pomodoroCount % pomodoroSettings.longBreakInterval

  if (!mounted) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 pb-8">
      {/* Phase tabs */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {(['work', 'short_break', 'long_break'] as Phase[]).map((p) => (
          <span
            key={p}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              phase === p ? PHASE_BADGE_CLASS[p] : 'border-gray-800 text-gray-700'
            }`}
          >
            {PHASE_LABEL[p]}
          </span>
        ))}
      </div>

      {/* Task name */}
      {task && (
        <div className="text-center">
          <p className="text-gray-600 text-xs mb-1 uppercase tracking-wider">作業中のタスク</p>
          <h1 className="text-lg font-bold text-white max-w-sm">{task.title}</h1>
          {task.reason && <p className="text-gray-600 text-xs mt-1">💡 {task.reason}</p>}
        </div>
      )}

      {/* Circular timer */}
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="88" fill="none" stroke="#1f2937" strokeWidth="10" />
          <motion.circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke={PHASE_COLOR[phase]}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            transition={{ duration: 0.8 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold text-white tabular-nums">{fmt(secondsLeft)}</span>
          <span className={`text-xs mt-2 ${PHASE_TEXT_CLASS[phase]}`}>{PHASE_LABEL[phase]}</span>
        </div>
      </div>

      {/* Pomodoro counter */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: pomodoroSettings.longBreakInterval }).map((_, i) => (
          <span
            key={i}
            className={`text-lg transition-opacity ${i < cyclePos ? 'opacity-100' : 'opacity-20'}`}
          >
            🍅
          </span>
        ))}
        {totalPomodoros > 0 && (
          <span className="text-xs text-gray-600 ml-2">合計 {totalPomodoros}本</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReset}
          title="リセット"
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-300 text-xl transition-colors"
        >
          ↺
        </button>
        <button
          onClick={() => setIsRunning((r) => !r)}
          className={`w-16 h-16 rounded-full text-white text-2xl font-bold shadow-lg transition-all active:scale-95 ${
            isRunning ? 'bg-gray-700 hover:bg-gray-600' : PHASE_BTN_CLASS[phase]
          }`}
        >
          {isRunning ? '⏸' : '▶'}
        </button>
        <button
          onClick={handleSkip}
          title="スキップ"
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-300 text-xl transition-colors"
        >
          ⏭
        </button>
      </div>

      {/* Interruption counter (work phase only) */}
      {phase === 'work' && focusSession && (
        <button
          onClick={addInterruption}
          className="flex flex-col items-center gap-1 text-gray-600 hover:text-yellow-400 transition-colors"
        >
          <span className="text-xl">⚡</span>
          <span className="text-xs">中断 ({focusSession.interruptions})</span>
        </button>
      )}

      {/* Task actions */}
      {task ? (
        <div className="flex gap-3">
          <button
            onClick={() => {
              endFocus()
              router.push('/')
            }}
            className="border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white rounded-xl px-5 py-2.5 text-sm transition-colors"
          >
            中断して戻る
          </button>
          <button
            onClick={() => {
              completeTask(task.id)
              endFocus()
              router.push('/')
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
          >
            ✓ タスク完了！
          </button>
        </div>
      ) : (
        <button
          onClick={() => router.push('/todos')}
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          タスクと紐づけて開始 →
        </button>
      )}

      {/* Settings toggle */}
      <button
        onClick={() => setShowSettings((s) => !s)}
        className="text-xs text-gray-700 hover:text-gray-400 transition-colors"
      >
        ⚙ タイマー設定 {showSettings ? '▲' : '▼'}
      </button>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-sm overflow-hidden"
          >
            <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">タイマー設定</h3>

              {(
                [
                  { label: '作業時間', key: 'workMinutes', unit: '分', min: 1, max: 60 },
                  { label: '小休憩', key: 'shortBreakMinutes', unit: '分', min: 1, max: 30 },
                  { label: '長休憩', key: 'longBreakMinutes', unit: '分', min: 1, max: 60 },
                  { label: '長休憩まで', key: 'longBreakInterval', unit: '回', min: 2, max: 8 },
                ] as {
                  label: string
                  key: keyof Pick<
                    PomodoroSettings,
                    'workMinutes' | 'shortBreakMinutes' | 'longBreakMinutes' | 'longBreakInterval'
                  >
                  unit: string
                  min: number
                  max: number
                }[]
              ).map(({ label, key, unit, min, max }) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={min}
                      max={max}
                      value={pomodoroSettings[key]}
                      onChange={(e) => {
                        const val = Math.min(max, Math.max(min, Number(e.target.value)))
                        updatePomodoroSettings({ [key]: val })
                        // Reset timer if the changed setting affects current phase
                        if (
                          (key === 'workMinutes' && phase === 'work') ||
                          (key === 'shortBreakMinutes' && phase === 'short_break') ||
                          (key === 'longBreakMinutes' && phase === 'long_break')
                        ) {
                          setIsRunning(false)
                          setSecondsLeft(val * 60)
                        }
                      }}
                      className="w-16 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-xs text-gray-500 w-4">{unit}</span>
                  </div>
                </div>
              ))}

              <div className="space-y-3 pt-2 border-t border-gray-700/60">
                {(
                  [
                    { label: '休憩を自動開始', key: 'autoStartBreaks' },
                    { label: '次の作業を自動開始', key: 'autoStartWork' },
                  ] as { label: string; key: keyof Pick<PomodoroSettings, 'autoStartBreaks' | 'autoStartWork'> }[]
                ).map(({ label, key }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{label}</span>
                    <button
                      onClick={() => updatePomodoroSettings({ [key]: !pomodoroSettings[key] })}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        pomodoroSettings[key] ? 'bg-indigo-600' : 'bg-gray-700'
                      }`}
                    >
                      <motion.div
                        animate={{ x: pomodoroSettings[key] ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
