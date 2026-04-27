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
