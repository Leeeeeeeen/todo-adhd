import { createClient } from '@/lib/supabase/client'
import { Task } from '@/types'

function toDbRow(task: Task, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    client_id: task.id,
    title: task.title,
    description: task.description ?? null,
    priority: task.priority,
    estimated_minutes: task.estimatedMinutes,
    status: task.status,
    is_top3: task.isTop3,
    top3_order: task.top3Order ?? null,
    due_date: task.dueDate ?? null,
    completed_at: task.completedAt ?? null,
    postpone_count: task.postponeCount,
    reason: task.reason ?? null,
    tags: task.tags,
    created_at: task.createdAt,
  }
}

function fromDbRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    priority: row.priority as Task['priority'],
    estimatedMinutes: row.estimated_minutes as Task['estimatedMinutes'],
    status: row.status as Task['status'],
    isTop3: row.is_top3 as boolean,
    top3Order: (row.top3_order as number) ?? undefined,
    dueDate: (row.due_date as string) ?? undefined,
    completedAt: (row.completed_at as string) ?? undefined,
    postponeCount: row.postpone_count as number,
    reason: (row.reason as string) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    createdAt: row.created_at as string,
  }
}

export async function fetchAllTasks(userId: string): Promise<Task[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(fromDbRow)
}

export async function upsertTask(task: Task, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('tasks')
    .upsert(toDbRow(task, userId), { onConflict: 'id' })

  if (error) throw error
}

export async function upsertTasks(tasks: Task[], userId: string): Promise<void> {
  if (tasks.length === 0) return
  const supabase = createClient()
  const { error } = await supabase
    .from('tasks')
    .upsert(tasks.map((t) => toDbRow(t, userId)), { onConflict: 'id' })

  if (error) throw error
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function fetchUserSettings(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

export async function upsertUserSettings(userId: string, settings: {
  birth_date?: string | null
  expected_lifespan?: number
  show_life_countdown?: boolean
  theme?: string
  display_name?: string
}): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' })

  if (error) throw error
}
