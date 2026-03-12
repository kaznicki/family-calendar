import {
  eachWeekOfInterval,
  addDays,
  addMonths,
  subMonths,
  format,
  isToday,
  isSaturday,
  isSunday,
  getMonth,
  getDate,
  isThisWeek,
} from 'date-fns'

export interface WeekData {
  weekStart: Date
  weekEnd: Date
  days: Date[]
  label: string
}

export function generateWeeks(today: Date = new Date()): WeekData[] {
  const start = subMonths(today, 6)
  const end = addMonths(today, 18)

  const weekStarts = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 })

  return weekStarts.map((weekStart) => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    return {
      weekStart,
      weekEnd: days[6],
      days,
      label: formatWeekRange(weekStart, days[6]),
    }
  })
}

export function formatWeekRange(start: Date, end: Date): string {
  if (format(start, 'MMM') === format(end, 'MMM')) {
    return `${format(start, 'MMM d')}\u2013${format(end, 'd')}`
  }
  return `${format(start, 'MMM d')}\u2013${format(end, 'MMM d')}`
}

export function isDayWeekend(date: Date): boolean {
  return isSaturday(date) || isSunday(date)
}

export function isDayToday(date: Date): boolean {
  return isToday(date)
}

// ─── Phase 3: Birthday entry type ─────────────────────────────────────────────

export interface BirthdayEntry {
  id: string
  name: string
  month: number  // 1-12
  day: number    // 1-31
}

// ─── Phase 3: Holiday helper ───────────────────────────────────────────────────

/**
 * Returns true if the given ISO date string appears as a key in the holidays map.
 * The map uses key presence (value = true) to mark holidays.
 */
export function isDayHoliday(isoDate: string, holidays: Record<string, boolean>): boolean {
  return !!holidays[isoDate]
}

// ─── Phase 3: Birthday helper ──────────────────────────────────────────────────

/**
 * Returns the BirthdayEntry whose month+day matches the given date, or undefined.
 * Year-agnostic: a birthday for March 17 matches any year.
 */
export function isDayBirthday(date: Date, birthdays: BirthdayEntry[]): BirthdayEntry | undefined {
  return birthdays.find(b => b.month === getMonth(date) + 1 && b.day === getDate(date))
}

// ─── Phase 3: Print weeks slicer ──────────────────────────────────────────────

/**
 * Returns the 10 consecutive WeekData entries starting from the current week.
 * Uses generateWeeks() range (6 months back + 18 months forward), finds the
 * current week, and slices 10 entries forward.
 */
export function getPrintWeeks(today: Date = new Date()): WeekData[] {
  const allWeeks = generateWeeks(today)
  const currentIdx = allWeeks.findIndex(w => isThisWeek(w.weekStart, { weekStartsOn: 0 }))
  if (currentIdx === -1) return allWeeks.slice(0, 10)
  return allWeeks.slice(currentIdx, currentIdx + 10)
}
