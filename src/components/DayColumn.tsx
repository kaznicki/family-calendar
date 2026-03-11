import { isDayWeekend, isDayToday } from '../lib/dates'
import { EventSlot } from './EventSlot'
import { format } from 'date-fns'
import type { CalendarEvent } from '../lib/people'

interface DayColumnProps {
  date: Date
  events?: CalendarEvent[]
  slotMap?: Map<string, number>
}

export function DayColumn({ date, events = [], slotMap = new Map() }: DayColumnProps) {
  const isWeekend = isDayWeekend(date)
  const isToday = isDayToday(date)
  const isoDate = format(date, 'yyyy-MM-dd')

  return (
    <div
      data-today={isToday ? 'true' : undefined}
      className={[
        'flex flex-col min-w-0',
        isWeekend ? 'bg-weekend-bg' : '',
        isToday ? 'bg-today-bg' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* Date number header — small, not bold */}
      <div className={[
        'text-center text-xs py-0.5 leading-none',
        isToday ? 'font-semibold text-blue-600' : 'text-gray-500',
      ].join(' ')}>
        {format(date, 'd')}
      </div>

      {/* 5 fixed-height event slots indexed 0-4 */}
      {Array.from({ length: 5 }, (_, slotIndex) => {
        const ev = events.find(e => slotMap.get(e.id) === slotIndex) ?? null
        return (
          <EventSlot
            key={slotIndex}
            event={ev}
            date={isoDate}
            slotIndex={slotIndex}
          />
        )
      })}
    </div>
  )
}
