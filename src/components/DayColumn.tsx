import { isDayWeekend, isDayToday } from '../lib/dates'
import { EventSlot } from './EventSlot'
import { format } from 'date-fns'
import type { CalendarEvent } from '../lib/people'

interface DayColumnProps {
  date: Date
  events?: CalendarEvent[]
  slotMap?: Map<string, number>
  isSelected?: boolean
  onPointerDown?: (e: React.PointerEvent<HTMLElement>, date: string) => void
  onPointerMove?: (e: React.PointerEvent<HTMLElement>, date: string) => void
}

export function DayColumn({
  date,
  events = [],
  slotMap = new Map(),
  isSelected = false,
  onPointerDown,
  onPointerMove,
}: DayColumnProps) {
  const isWeekend = isDayWeekend(date)
  const isToday = isDayToday(date)
  const isoDate = format(date, 'yyyy-MM-dd')

  // Count overflow events for this date
  const overflowCount = events.filter(e => slotMap.get(e.id) === -1).length

  return (
    <div
      data-today={isToday ? 'true' : undefined}
      className={[
        'flex flex-col min-w-0',
        isWeekend ? 'bg-weekend-bg' : '',
        isToday ? 'bg-today-bg' : '',
        isSelected ? 'bg-blue-50' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* Date number header */}
      <div className={[
        'text-center text-xs py-0.5 leading-none',
        isToday ? 'font-semibold text-blue-600' : 'text-gray-500',
      ].join(' ')}>
        {format(date, 'd')}
      </div>

      {/* Slots 1-4: single-day events (slot 0 is the multi-day row in WeekRow) */}
      {Array.from({ length: 4 }, (_, i) => {
        const slotIndex = i + 1
        const ev = events.find(e => slotMap.get(e.id) === slotIndex) ?? null
        return (
          <EventSlot
            key={slotIndex}
            event={ev}
            date={isoDate}
            slotIndex={slotIndex}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
          />
        )
      })}

      {/* Overflow indicator */}
      {overflowCount > 0 && (
        <div className="text-[9px] text-gray-400 text-center leading-none pb-0.5">
          +{overflowCount}
        </div>
      )}
    </div>
  )
}
