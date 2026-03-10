import type { WeekData } from '../lib/dates'
import { DayColumn } from './DayColumn'

interface WeekRowProps {
  week: WeekData
  todayRef?: React.RefObject<HTMLDivElement | null>
  isCurrentWeek: boolean
}

export function WeekRow({ week, todayRef, isCurrentWeek }: WeekRowProps) {
  return (
    <div ref={isCurrentWeek ? todayRef : undefined}>
      {/* Week-range label: small text, scrolls with content (not sticky) */}
      <div className="text-[10px] text-gray-400 px-1 pt-1 col-span-7">
        {week.label}
      </div>
      {/* 7-column grid for the day columns */}
      <div className="grid grid-cols-7">
        {week.days.map((date) => (
          <DayColumn key={date.toISOString()} date={date} />
        ))}
      </div>
    </div>
  )
}
