import { describe, it, expect } from 'vitest'
import { generateWeeks, formatWeekRange, isDayWeekend, isDayToday } from './dates'

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
