export function getDayRemainingSeconds(): number {
  const now = new Date()
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  return Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / 1000))
}

export function getDayProgressPercent(): number {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  const total = endOfDay.getTime() - startOfDay.getTime()
  const elapsed = now.getTime() - startOfDay.getTime()
  return Math.min(100, Math.floor((elapsed / total) * 100))
}

export function getWeekRemainingSeconds(): number {
  const now = new Date()
  const endOfWeek = new Date(now)
  // 週末（日曜23:59:59）まで
  const daysUntilSunday = 7 - now.getDay()
  endOfWeek.setDate(now.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday))
  endOfWeek.setHours(23, 59, 59, 999)
  return Math.max(0, Math.floor((endOfWeek.getTime() - now.getTime()) / 1000))
}

export function getWeekProgressPercent(): number {
  const now = new Date()
  // 週の始まりを月曜00:00:00とする
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay() // 日曜=7
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - (dayOfWeek - 1))
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  const total = endOfWeek.getTime() - startOfWeek.getTime()
  const elapsed = now.getTime() - startOfWeek.getTime()
  return Math.min(100, Math.floor((elapsed / total) * 100))
}

export function getWeekDayLabel(): string {
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return days[new Date().getDay()]
}

export function getYearRemainingSeconds(): number {
  const now = new Date()
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
  return Math.max(0, Math.floor((endOfYear.getTime() - now.getTime()) / 1000))
}

export function getYearProgressPercent(): number {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
  const total = endOfYear.getTime() - startOfYear.getTime()
  const elapsed = now.getTime() - startOfYear.getTime()
  return Math.min(100, Math.floor((elapsed / total) * 100))
}

export function getGoalTargetDate(
  goalType: 'age' | 'date',
  birthDate: string,
  goalAge: number,
  goalDate: string
): Date | null {
  if (goalType === 'date') {
    if (!goalDate) return null
    return new Date(goalDate + 'T23:59:59')
  }
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null
  const target = new Date(birth)
  target.setFullYear(birth.getFullYear() + (goalAge ?? 80))
  return target
}

export function getGoalRemainingSeconds(
  goalType: 'age' | 'date',
  birthDate: string,
  goalAge: number,
  goalDate: string
): number {
  const target = getGoalTargetDate(goalType, birthDate, goalAge, goalDate)
  if (!target) return 0
  return Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000))
}

export function getGoalProgressPercent(
  goalType: 'age' | 'date',
  birthDate: string,
  goalAge: number,
  goalDate: string
): number {
  const target = getGoalTargetDate(goalType, birthDate, goalAge, goalDate)
  if (!target) return 0
  let start: Date
  if (goalType === 'date') {
    start = new Date() // progress from now is not meaningful; use a fixed origin
    // For date type, show % of year elapsed toward goal from Jan 1 of current year
    start = new Date(new Date().getFullYear(), 0, 1)
  } else {
    if (!birthDate) return 0
    start = new Date(birthDate)
  }
  const total = target.getTime() - start.getTime()
  const elapsed = Date.now() - start.getTime()
  return Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)))
}

export function getLifeRemainingSeconds(birthDate: string, expectedLifespan: number): number {
  const birth = new Date(birthDate)
  const death = new Date(birth)
  death.setFullYear(birth.getFullYear() + expectedLifespan)
  return Math.max(0, Math.floor((death.getTime() - Date.now()) / 1000))
}

export function getLifeProgressPercent(birthDate: string, expectedLifespan: number): number {
  const birth = new Date(birthDate)
  const death = new Date(birth)
  death.setFullYear(birth.getFullYear() + expectedLifespan)
  const total = death.getTime() - birth.getTime()
  const elapsed = Date.now() - birth.getTime()
  return Math.min(100, Math.floor((elapsed / total) * 100))
}

export function formatSeconds(totalSeconds: number): {
  hours: number
  minutes: number
  seconds: number
  days: number
  years: number
  months: number
} {
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const totalDays = Math.floor(totalHours / 24)
  const years = Math.floor(totalDays / 365)
  const months = Math.floor((totalDays % 365) / 30)
  const days = totalDays % 30

  return { seconds, minutes, hours, days, years, months }
}

export function formatDayDisplay(totalSeconds: number): string {
  const { hours, minutes, seconds } = formatSeconds(totalSeconds)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
