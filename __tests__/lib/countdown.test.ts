import {
  getDayRemainingSeconds,
  getDayProgressPercent,
  getLifeRemainingSeconds,
  getLifeProgressPercent,
  formatSeconds,
  formatDayDisplay,
} from '@/lib/countdown'

describe('formatSeconds', () => {
  it('正しく分解できる', () => {
    const result = formatSeconds(3661)
    expect(result.hours).toBe(1)
    expect(result.minutes).toBe(1)
    expect(result.seconds).toBe(1)
  })

  it('0秒のとき全て0', () => {
    const result = formatSeconds(0)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(0)
    expect(result.seconds).toBe(0)
  })

  it('1日分 (86400秒) を正しく分解', () => {
    const result = formatSeconds(86400)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(0)
    expect(result.seconds).toBe(0)
    expect(result.days).toBe(1) // 1 % 30 = 1
  })

  it('1年分 (365日) を正しく分解', () => {
    const result = formatSeconds(365 * 24 * 3600)
    expect(result.years).toBe(1)
  })
})

describe('formatDayDisplay', () => {
  it('HH:MM:SS 形式で返す', () => {
    expect(formatDayDisplay(3661)).toBe('01:01:01')
  })

  it('0秒で 00:00:00', () => {
    expect(formatDayDisplay(0)).toBe('00:00:00')
  })

  it('1時間で 01:00:00', () => {
    expect(formatDayDisplay(3600)).toBe('01:00:00')
  })

  it('59秒で 00:00:59', () => {
    expect(formatDayDisplay(59)).toBe('00:00:59')
  })
})

describe('getDayRemainingSeconds', () => {
  it('0以上の数値を返す', () => {
    expect(getDayRemainingSeconds()).toBeGreaterThanOrEqual(0)
  })

  it('86400秒以下を返す', () => {
    expect(getDayRemainingSeconds()).toBeLessThanOrEqual(86400)
  })

  it('深夜0時直前では残り数秒になる', () => {
    jest.useFakeTimers()
    // ローカル時刻で 23:59:58 に設定
    const near_midnight = new Date()
    near_midnight.setHours(23, 59, 58, 0)
    jest.setSystemTime(near_midnight)
    const remaining = getDayRemainingSeconds()
    expect(remaining).toBeLessThan(10)
    jest.useRealTimers()
  })
})

describe('getDayProgressPercent', () => {
  it('0〜100の範囲を返す', () => {
    const pct = getDayProgressPercent()
    expect(pct).toBeGreaterThanOrEqual(0)
    expect(pct).toBeLessThanOrEqual(100)
  })

  it('昼12時ごろは約50%', () => {
    jest.useFakeTimers()
    // ローカル正午を設定
    const noon = new Date()
    noon.setHours(12, 0, 0, 0)
    jest.setSystemTime(noon)
    const pct = getDayProgressPercent()
    expect(pct).toBeGreaterThanOrEqual(49)
    expect(pct).toBeLessThanOrEqual(51)
    jest.useRealTimers()
  })
})

describe('getLifeRemainingSeconds', () => {
  it('将来の寿命に対して正の値を返す', () => {
    const remaining = getLifeRemainingSeconds('1990-01-01', 85)
    expect(remaining).toBeGreaterThan(0)
  })

  it('すでに寿命を超えた場合は0を返す', () => {
    const remaining = getLifeRemainingSeconds('1900-01-01', 50)
    expect(remaining).toBe(0)
  })
})

describe('getLifeProgressPercent', () => {
  it('0〜100の範囲を返す', () => {
    const pct = getLifeProgressPercent('1990-01-01', 85)
    expect(pct).toBeGreaterThanOrEqual(0)
    expect(pct).toBeLessThanOrEqual(100)
  })

  it('生まれた直後は0%に近い', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2000-01-02').getTime())
    const pct = getLifeProgressPercent('2000-01-01', 85)
    expect(pct).toBeLessThan(1)
    jest.useRealTimers()
  })

  it('寿命を過ぎると100%', () => {
    const pct = getLifeProgressPercent('1900-01-01', 50)
    expect(pct).toBe(100)
  })
})
