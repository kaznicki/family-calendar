import type { WeekData } from '../lib/dates'
import { DayColumn } from './DayColumn'
import { useEventsMap } from '../lib/eventStore'
import { computeSlotLayout } from '../lib/slotLayout'
import type { LayoutEvent } from '../lib/slotLayout'
import { format } from 'date-fns'
import type { CalendarEvent } from '../lib/people'

interface WeekRowProps {
  week: WeekData
  todayRef?: React.RefObject<HTMLDivElement | null>
  isCurrentWeek: boolean
}

export function WeekRow({ week, todayRef, isCurrentWeek }: WeekRowProps) {
  const allEvents = useEventsMap()

  // Collect all events for this week's date range (as CalendarEvent-shaped objects)
  const weekEvents: LayoutEvent[] = []
  for (const date of week.days) {
    const isoDate = format(date, 'yyyy-MM-dd')
    const dayEvents = allEvents[isoDate] ?? []
    for (const raw of dayEvents) {
      weekEvents.push(raw as unknown as LayoutEvent)
    }
  }

  // Compute slot assignments for this week's events
  const slotMap = computeSlotLayout(weekEvents, week.weekStart, week.weekEnd)

  return (
    <div ref={isCurrentWeek ? todayRef : undefined}>
      {/* Week-range label: small text, scrolls with content (not sticky) */}
      <div className="text-[10px] text-gray-400 px-1 pt-1 col-span-7">
        {week.label}
      </div>
      {/* 7-column grid for the day columns */}
      <div className="grid grid-cols-7">
        {week.days.map((date) => {
          const isoDate = format(date, 'yyyy-MM-dd')
          const dayEvents = (allEvents[isoDate] ?? []) as unknown as CalendarEvent[]
          return (
            <DayColumn
              key={date.toISOString()}
              date={date}
              events={dayEvents}
              slotMap={slotMap}
            />
          )
        })}
      </div>
    </div>
  )
}
