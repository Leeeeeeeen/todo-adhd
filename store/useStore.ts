import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Task, UserSettings, FocusSession, Priority, EstimatedTime, AuthUser, SyncStatus, PomodoroSettings } from '@/types'
import {
  fetchAllTasks,
  upsertTask,
  upsertTasks,
  deleteTask as dbDeleteTask,
  fetchUserSettings,
  upsertUserSettings,
} from '@/lib/sync/taskRepository'

interface StoreState {
  tasks: Task[]
  settings: UserSettings
  pomodoroSettings: PomodoroSettings
  focusSession: FocusSession | null
  quickCaptureOpen: boolean
  currentUser: AuthUser | null
  syncStatus: SyncStatus
  syncError: string | null
  lastSyncedAt: string | null

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'postponeCount' | 'isTop3'>) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  postponeTask: (id: string) => void
  setTop3: (id: string, order: 1 | 2 | 3 | null) => void

  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void

  // Focus session
  startFocus: (taskId: string) => void
  endFocus: () => void
  addInterruption: () => void

  // Quick capture
  setQuickCaptureOpen: (open: boolean) => void

  // Auth
  setCurrentUser: (user: AuthUser | null) => void
  loadFromCloud: (userId: string) => Promise<void>
  signOut: () => Promise<void>
}

const defaultPomodoroSettings: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
}

const defaultSettings: UserSettings = {
  birthDate: '',
  expectedLifespan: 85,
  showLifeCountdown: false,
  goalType: 'age',
  goalAge: 80,
  goalDate: '',
  theme: 'dark',
  name: '',
}

async function syncSettingsToCloud(userId: string, settings: UserSettings) {
  try {
    await upsertUserSettings(userId, {
      birth_date: settings.birthDate || null,
      expected_lifespan: settings.expectedLifespan,
      show_life_countdown: settings.showLifeCountdown,
      theme: settings.theme,
      display_name: settings.name,
    })
  } catch {
    // silent fail for settings sync
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      tasks: [],
      settings: defaultSettings,
      pomodoroSettings: defaultPomodoroSettings,
      focusSession: null,
      quickCaptureOpen: false,
      currentUser: null,
      syncStatus: 'idle',
      syncError: null,
      lastSyncedAt: null,

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: uuidv4(),
          isTop3: false,
          postponeCount: 0,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ tasks: [task, ...state.tasks] }))

        const { currentUser } = get()
        if (currentUser) {
          upsertTask(task, currentUser.id).catch((err) => {
            // ローカルのタスクは消さない。同期エラーのみ記録。
            set({ syncStatus: 'error', syncError: err instanceof Error ? err.message : '同期に失敗しました' })
          })
        }

        return task
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))

        const { currentUser } = get()
        if (currentUser) {
          const updated = get().tasks.find((t) => t.id === id)
          if (updated) {
            upsertTask(updated, currentUser.id).catch((err) => {
              // ローカルの変更は消さない。同期エラーのみ記録。
              set({ syncStatus: 'error', syncError: err instanceof Error ? err.message : '同期に失敗しました' })
            })
          }
        }
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))

        const { currentUser } = get()
        if (currentUser) {
          dbDeleteTask(id, currentUser.id).catch((err) => {
            // ローカルの削除は維持。同期エラーのみ記録。
            set({ syncStatus: 'error', syncError: err instanceof Error ? err.message : '同期に失敗しました' })
          })
        }
      },

      completeTask: (id) => {
        get().updateTask(id, { status: 'done', completedAt: new Date().toISOString() })
      },

      postponeTask: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (task) {
          get().updateTask(id, { postponeCount: task.postponeCount + 1 })
        }
      },

      setTop3: (id, order) => {
        set((state) => {
          let tasks = state.tasks.map((t) => {
            if (order !== null && t.top3Order === order && t.id !== id) {
              return { ...t, isTop3: false, top3Order: undefined }
            }
            return t
          })
          tasks = tasks.map((t) => {
            if (t.id === id) {
              return { ...t, isTop3: order !== null, top3Order: order ?? undefined }
            }
            return t
          })
          return { tasks }
        })

        const { currentUser } = get()
        if (currentUser) {
          const affected = get().tasks.filter(
            (t) => t.id === id || (order !== null && t.top3Order === order)
          )
          upsertTasks(affected, currentUser.id).catch(() => {})
        }
      },

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }))
        const { currentUser, settings } = get()
        if (currentUser) {
          syncSettingsToCloud(currentUser.id, { ...settings, ...updates })
        }
      },

      updatePomodoroSettings: (updates) => {
        set((state) => ({ pomodoroSettings: { ...state.pomodoroSettings, ...updates } }))
      },

      startFocus: (taskId) => {
        set({
          focusSession: {
            id: uuidv4(),
            taskId,
            startedAt: new Date().toISOString(),
            durationMinutes: 0,
            interruptions: 0,
          },
        })
        get().updateTask(taskId, { status: 'in_progress' })
      },

      endFocus: () => {
        const session = get().focusSession
        if (!session) return
        const taskId = session.taskId
        const task = get().tasks.find((t) => t.id === taskId)
        if (task && task.status === 'in_progress') {
          get().updateTask(taskId, { status: 'todo' })
        }
        set({ focusSession: null })
      },

      addInterruption: () => {
        set((state) => ({
          focusSession: state.focusSession
            ? { ...state.focusSession, interruptions: state.focusSession.interruptions + 1 }
            : null,
        }))
      },

      setQuickCaptureOpen: (open) => set({ quickCaptureOpen: open }),

      setCurrentUser: (user) => set({ currentUser: user }),

      loadFromCloud: async (userId: string) => {
        set({ syncStatus: 'syncing', syncError: null })
        try {
          // LocalStorageのタスクをクラウドにマイグレーション
          const localTasks = get().tasks
          if (localTasks.length > 0) {
            await upsertTasks(localTasks, userId)
          }

          // クラウドから全タスクを取得
          const cloudTasks = await fetchAllTasks(userId)

          // 設定も同期
          const cloudSettings = await fetchUserSettings(userId)
          if (cloudSettings) {
            set((state) => ({
              settings: {
                ...state.settings,
                birthDate: cloudSettings.birth_date ?? state.settings.birthDate,
                expectedLifespan: cloudSettings.expected_lifespan,
                showLifeCountdown: cloudSettings.show_life_countdown,
                theme: cloudSettings.theme as UserSettings['theme'],
                name: cloudSettings.display_name,
              },
            }))
          }

          set({
            tasks: cloudTasks,
            syncStatus: 'success',
            lastSyncedAt: new Date().toISOString(),
          })
        } catch (err) {
          set({
            syncStatus: 'error',
            syncError: err instanceof Error ? err.message : '同期に失敗しました',
          })
        }
      },

      signOut: async () => {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        await supabase.auth.signOut()
        set({
          currentUser: null,
          syncStatus: 'idle',
          syncError: null,
          lastSyncedAt: null,
        })
      },
    }),
    {
      name: 'todo-adhd-storage',
      partialize: (state) => ({
        // ログイン中もローカルにキャッシュしておく（クラウド同期失敗時のフォールバック）
        tasks: state.tasks,
        settings: state.settings,
        pomodoroSettings: state.pomodoroSettings,
      }),
    }
  )
)
