/**
 * ストアのユニットテスト
 * Supabase の呼び出しはすべてモックするため、ネット接続不要
 */

// モジュールモックは import より前に宣言する必要がある
jest.mock('@/lib/sync/taskRepository', () => ({
  fetchAllTasks: jest.fn().mockResolvedValue([]),
  upsertTask: jest.fn().mockResolvedValue(undefined),
  upsertTasks: jest.fn().mockResolvedValue(undefined),
  deleteTask: jest.fn().mockResolvedValue(undefined),
  fetchUserSettings: jest.fn().mockResolvedValue(null),
  upsertUserSettings: jest.fn().mockResolvedValue(undefined),
}))

let uuidCounter = 0
jest.mock('uuid', () => ({
  v4: jest.fn(() => `mock-uuid-${++uuidCounter}`),
}))

// Zustand の persist は localStorage を使うのでモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

import { useStore } from '@/store/useStore'
import * as taskRepo from '@/lib/sync/taskRepository'

// テストごとにストアをリセット
beforeEach(() => {
  localStorageMock.clear()
  useStore.setState({
    tasks: [],
    currentUser: null,
    syncStatus: 'idle',
    syncError: null,
    lastSyncedAt: null,
    focusSession: null,
    quickCaptureOpen: false,
  })
  jest.clearAllMocks()
})

// ────────────────────────────────────────────
// addTask
// ────────────────────────────────────────────
describe('addTask', () => {
  const baseTask = {
    title: 'テストタスク',
    priority: 'medium' as const,
    estimatedMinutes: 30 as const,
    status: 'todo' as const,
    tags: [],
  }

  it('タスクをストアに追加できる', () => {
    useStore.getState().addTask(baseTask)
    expect(useStore.getState().tasks).toHaveLength(1)
    expect(useStore.getState().tasks[0].title).toBe('テストタスク')
  })

  it('追加されたタスクに id と createdAt が付与される', () => {
    const task = useStore.getState().addTask(baseTask)
    expect(task.id).toMatch(/^mock-uuid-\d+$/)
    expect(task.createdAt).toBeTruthy()
    expect(task.postponeCount).toBe(0)
    expect(task.isTop3).toBe(false)
  })

  it('未ログイン時は upsertTask を呼ばない', () => {
    useStore.getState().addTask(baseTask)
    expect(taskRepo.upsertTask).not.toHaveBeenCalled()
  })

  it('ログイン済み時は upsertTask を呼ぶ', () => {
    useStore.setState({ currentUser: { id: 'user-1', email: 'test@example.com' } })
    useStore.getState().addTask(baseTask)
    expect(taskRepo.upsertTask).toHaveBeenCalled()
  })

  it('Supabase エラーが発生してもタスクはローカルに残る', async () => {
    ;(taskRepo.upsertTask as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    useStore.setState({ currentUser: { id: 'user-1', email: 'test@example.com' } })
    useStore.getState().addTask(baseTask)
    // 非同期エラーが処理されるまで待つ
    await new Promise((r) => setTimeout(r, 10))
    expect(useStore.getState().tasks).toHaveLength(1)
    expect(useStore.getState().syncStatus).toBe('error')
  })
})

// ────────────────────────────────────────────
// updateTask
// ────────────────────────────────────────────
describe('updateTask', () => {
  it('タスクのフィールドを更新できる', () => {
    const task = useStore.getState().addTask({
      title: '元のタイトル',
      priority: 'low' as const,
      estimatedMinutes: 15 as const,
      status: 'todo' as const,
      tags: [],
    })
    useStore.getState().updateTask(task.id, { title: '新しいタイトル' })
    const updated = useStore.getState().tasks.find((t) => t.id === task.id)
    expect(updated?.title).toBe('新しいタイトル')
  })

  it('Supabase エラーが発生しても更新はローカルに残る', async () => {
    ;(taskRepo.upsertTask as jest.Mock).mockRejectedValue(new Error('fail'))
    useStore.setState({ currentUser: { id: 'user-1', email: 'test@example.com' } })
    const task = useStore.getState().addTask({
      title: 'タスク',
      priority: 'high' as const,
      estimatedMinutes: 60 as const,
      status: 'todo' as const,
      tags: [],
    })
    useStore.getState().updateTask(task.id, { title: '変更後' })
    await new Promise((r) => setTimeout(r, 10))
    const found = useStore.getState().tasks.find((t) => t.id === task.id)
    expect(found?.title).toBe('変更後')
  })
})

// ────────────────────────────────────────────
// deleteTask
// ────────────────────────────────────────────
describe('deleteTask', () => {
  it('タスクを削除できる', () => {
    const task = useStore.getState().addTask({
      title: '削除対象',
      priority: 'low' as const,
      estimatedMinutes: 5 as const,
      status: 'todo' as const,
      tags: [],
    })
    useStore.getState().deleteTask(task.id)
    expect(useStore.getState().tasks).toHaveLength(0)
  })

  it('Supabase エラーが発生してもローカルからは削除される', async () => {
    ;(taskRepo.deleteTask as jest.Mock).mockRejectedValueOnce(new Error('fail'))
    useStore.setState({ currentUser: { id: 'user-1', email: 'test@example.com' } })
    const task = useStore.getState().addTask({
      title: 'タスク',
      priority: 'medium' as const,
      estimatedMinutes: 15 as const,
      status: 'todo' as const,
      tags: [],
    })
    useStore.getState().deleteTask(task.id)
    await new Promise((r) => setTimeout(r, 10))
    expect(useStore.getState().tasks).toHaveLength(0)
  })
})

// ────────────────────────────────────────────
// completeTask
// ────────────────────────────────────────────
describe('completeTask', () => {
  it('タスクのステータスを done にする', () => {
    const task = useStore.getState().addTask({
      title: '完了タスク',
      priority: 'high' as const,
      estimatedMinutes: 30 as const,
      status: 'todo' as const,
      tags: [],
    })
    useStore.getState().completeTask(task.id)
    const completed = useStore.getState().tasks.find((t) => t.id === task.id)
    expect(completed?.status).toBe('done')
    expect(completed?.completedAt).toBeTruthy()
  })
})

// ────────────────────────────────────────────
// postponeTask
// ────────────────────────────────────────────
describe('postponeTask', () => {
  it('postponeCount をインクリメントする', () => {
    const task = useStore.getState().addTask({
      title: '後回しタスク',
      priority: 'low' as const,
      estimatedMinutes: 15 as const,
      status: 'todo' as const,
      tags: [],
    })
    useStore.getState().postponeTask(task.id)
    const updated = useStore.getState().tasks.find((t) => t.id === task.id)
    expect(updated?.postponeCount).toBe(1)
  })

  it('複数回後回しにするとカウントが増える', () => {
    const task = useStore.getState().addTask({
      title: '後回し3回',
      priority: 'low' as const,
      estimatedMinutes: 5 as const,
      status: 'todo' as const,
      tags: [],
    })
    useStore.getState().postponeTask(task.id)
    useStore.getState().postponeTask(task.id)
    useStore.getState().postponeTask(task.id)
    const updated = useStore.getState().tasks.find((t) => t.id === task.id)
    expect(updated?.postponeCount).toBe(3)
  })
})

// ────────────────────────────────────────────
// setTop3
// ────────────────────────────────────────────
describe('setTop3', () => {
  it('タスクを Top3 に設定できる', () => {
    const task = useStore.getState().addTask({
      title: 'Top3 タスク',
      priority: 'high' as const,
      estimatedMinutes: 30 as const,
      status: 'todo' as const,
      tags: [],
    })
    useStore.getState().setTop3(task.id, 1)
    const updated = useStore.getState().tasks.find((t) => t.id === task.id)
    expect(updated?.isTop3).toBe(true)
    expect(updated?.top3Order).toBe(1)
  })

  it('null を渡すと Top3 から外れる', () => {
    const task = useStore.getState().addTask({
      title: '外すタスク',
      priority: 'high' as const,
      estimatedMinutes: 30 as const,
      status: 'todo' as const,
      tags: [],
    })
    useStore.getState().setTop3(task.id, 1)
    useStore.getState().setTop3(task.id, null)
    const updated = useStore.getState().tasks.find((t) => t.id === task.id)
    expect(updated?.isTop3).toBe(false)
  })

  it('同じ順位に別タスクを設定すると前のタスクが外れる', () => {
    const task1 = useStore.getState().addTask({
      title: 'タスク1',
      priority: 'high' as const,
      estimatedMinutes: 30 as const,
      status: 'todo' as const,
      tags: [],
    })
    const task2 = useStore.getState().addTask({
      title: 'タスク2',
      priority: 'high' as const,
      estimatedMinutes: 30 as const,
      status: 'todo' as const,
      tags: [],
    })
    useStore.getState().setTop3(task1.id, 1)
    useStore.getState().setTop3(task2.id, 1)

    const t1 = useStore.getState().tasks.find((t) => t.id === task1.id)
    const t2 = useStore.getState().tasks.find((t) => t.id === task2.id)
    expect(t1?.isTop3).toBe(false)
    expect(t2?.isTop3).toBe(true)
    expect(t2?.top3Order).toBe(1)
  })
})

// ────────────────────────────────────────────
// updateSettings
// ────────────────────────────────────────────
describe('updateSettings', () => {
  it('設定を更新できる', () => {
    useStore.getState().updateSettings({ name: 'テストユーザー', theme: 'light' })
    expect(useStore.getState().settings.name).toBe('テストユーザー')
    expect(useStore.getState().settings.theme).toBe('light')
  })
})
