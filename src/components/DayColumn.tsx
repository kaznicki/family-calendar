import { isDayWeekend, isDayToday } from '../lib/dates'
import { EventSlot } from './EventSlot'
import { format } from 'date-fns'

interface DayColumnProps {
  date: Date
}

export function DayColumn({ date }: DayColumnProps) {
  const isWeekend = isDayWeekend(date)
  const isToday = isDayToday(date)

  return (
    <div
      data-today={isToday ? 'true' : undefined}
      className={[
        'flex flex-col min-w-0',
        isWeekend ? 'bg-[--color-weekend-bg]' : '',
        isToday ? 'bg-[--color-today-bg]' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* Date number header — small, not bold */}
      <div className={[
        'text-center text-xs py-0.5 leading-none',
        isToday ? 'font-semibold text-blue-600' : 'text-gray-500',
      ].join(' ')}>
        {format(date, 'd')}
      </div>

      {/* 5 fixed-height event slots */}
      {Array.from({ length: 5 }, (_, i) => (
        <EventSlot key={i} />
      ))}
    </div>
  )
}
