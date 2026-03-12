import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateWeeks, formatWeekRange, isDayWeekend, isDayHoliday, isDayBirthday, getPrintWeeks, type BirthdayEntry } from './dates'

describe('generateWeeks', () => {
  it('returns ~104 weeks for a 24-month range', () => {
    const today = new Date(2026, 2, 10) // March 10, 2026 — fixed for determinism
    const weeks = generateWeeks(today)
    // 6 months back + 18 months forward ≈ 24 months ≈ 104 weeks
    expect(weeks.length).toBeGreaterThanOrEqual(100)
    expect(weeks.length).toBeLessThanOrEqual(110)
  })

  it('first week starts on a Sunday (weekStartsOn: 0)', () => {
    const today = new Date(2026, 2, 10)
    const weeks = generateWeeks(today)
    expect(weeks[0].weekStart.getDay()).toBe(0) // 0 = Sunday
  })

  it('each week has 7 days', () => {
    const today = new Date(2026, 2, 10)
    const weeks = generateWeeks(today)
    weeks.slice(0, 10).forEach((w) => {
      expect(w.days).toHaveLength(7)
    })
  })

  it('today falls within the generated range', () => {
    const today = new Date(2026, 2, 10)
    const weeks = generateWeeks(today)
    const allDays = weeks.flatMap((w) => w.days)
    const todayStr = today.toDateString()
    expect(allDays.some((d) => d.toDateString() === todayStr)).toBe(true)
  })
})

describe('formatWeekRange', () => {
  it('formats same-month range as "May 11\u201317"', () => {
    const start = new Date(2026, 4, 11)  // May 11
    const end = new Date(2026, 4, 17)    // May 17
    expect(formatWeekRange(start, end)).toBe('May 11\u201317')
  })

  it('formats cross-month range as "May 28\u2013Jun 3"', () => {
    const start = new Date(2026, 4, 28)  // May 28
    const end = new Date(2026, 5, 3)     // Jun 3
    expect(formatWeekRange(start, end)).toBe('May 28\u2013Jun 3')
  })
})

describe('isDayWeekend', () => {
  it('returns true for Saturday', () => {
    expect(isDayWeekend(new Date(2026, 2, 14))).toBe(true) // Sat
  })
  it('returns true for Sunday', () => {
    expect(isDayWeekend(new Date(2026, 2, 15))).toBe(true) // Sun
  })
  it('returns false for Monday', () => {
    expect(isDayWeekend(new Date(2026, 2, 16))).toBe(false) // Mon
  })
})

describe('isDayHoliday', () => {
  it('returns true when isoDate key exists in holidays map', () => {
    expect(isDayHoliday('2026-03-17', { '2026-03-17': true })).toBe(true)
  })

  it('returns false when holidays map is empty', () => {
    expect(isDayHoliday('2026-03-17', {})).toBe(false)
  })

  it('returns false when isoDate key does not match any holiday', () => {
    expect(isDayHoliday('2026-03-17', { '2026-03-18': true })).toBe(false)
  })
})

describe('isDayBirthday', () => {
  const birthdays: BirthdayEntry[] = [
    { id: 'x', name: 'Joy', month: 3, day: 17 },
  ]

  it('returns the entry when month and day match', () => {
    expect(isDayBirthday(new Date(2026, 2, 17), birthdays)).toEqual({
      id: 'x', name: 'Joy', month: 3, day: 17,
    })
  })

  it('is year-agnostic — still matches in a different year', () => {
    expect(isDayBirthday(new Date(2024, 2, 17), birthdays)).toEqual({
      id: 'x', name: 'Joy', month: 3, day: 17,
    })
  })

  it('returns undefined when day does not match', () => {
    expect(isDayBirthday(new Date(2026, 2, 18), birthdays)).toBeUndefined()
  })
})

describe('getPrintWeeks', () => {
  beforeEach(() => {
    // Pin system time to 2026-03-12 (Thursday — mid-week for determinism)
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns exactly 10 weeks', () => {
    expect(getPrintWeeks()).toHaveLength(10)
  })

  it('first element contains today (current week start on or before today, end on or after today)', () => {
    const weeks = getPrintWeeks()
    const today = new Date(2026, 2, 12)
    expect(weeks[0].weekStart.getTime()).toBeLessThanOrEqual(today.getTime())
    expect(weeks[0].weekEnd.getTime()).toBeGreaterThanOrEqual(today.getTime())
  })

  it('tenth element is 9 weeks after the first element', () => {
    const weeks = getPrintWeeks()
    const firstStart = weeks[0].weekStart.getTime()
    const tenthStart = weeks[9].weekStart.getTime()
    const nineWeeksMs = 9 * 7 * 24 * 60 * 60 * 1000
    expect(tenthStart - firstStart).toBe(nineWeeksMs)
  })
})
