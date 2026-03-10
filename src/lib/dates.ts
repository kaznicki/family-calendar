import {
  eachWeekOfInterval,
  addDays,
  addMonths,
  subMonths,
  format,
  isToday,
  isSaturday,
  isSunday,
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
