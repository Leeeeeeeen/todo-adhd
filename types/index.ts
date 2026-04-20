export type Priority = 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'skipped'
export type EstimatedTime = 5 | 15 | 30 | 60 | 999

export interface Task {
  id: string
  title: string
  description?: string
  parentTaskId?: string
  priority: Priority
  estimatedMinutes: EstimatedTime
  status: TaskStatus
  isTop3: boolean
  top3Order?: number // 1, 2, 3
  dueDate?: string
  completedAt?: string
  postponeCount: number
  reason?: string
  tags: string[]
  createdAt: string
}

export interface UserSettings {
  birthDate: string // ISO date string e.g. "1990-01-01"
  expectedLifespan: number // years, default 85
  showLifeCountdown: boolean
  theme: 'light' | 'dark' | 'auto'
  name: string
}

export interface FocusSession {
  id: string
  taskId: string
  startedAt: string
  endedAt?: string
  durationMinutes: number
  interruptions: number
}

export interface AuthUser {
  id: string
  email: string | undefined
  name?: string
  avatarUrl?: string
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success'

export interface CalendarTaskEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: Task
}
