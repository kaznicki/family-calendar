import type { WeekData } from '../lib/dates'
import { DayColumn } from './DayColumn'
import { EventCard } from './EventCard'
import { useEventsMap } from '../lib/eventStore'
import { computeSlotLayout } from '../lib/slotLayout'
import type { LayoutEvent } from '../lib/slotLayout'
import { format, parseISO, getDay, differenceInCalendarDays, max, min } from 'date-fns'
import type { CalendarEvent } from '../lib/people'

interface WeekRowProps {
  week: WeekData
  todayRef?: React.RefObject<HTMLDivElement | null>
  isCurrentWeek: boolean
  onPointerDown?: (e: React.PointerEvent<HTMLElement>, date: string) => void
  onPointerMove?: (e: React.PointerEvent<HTMLElement>, date: string) => void
  selectionDates?: string[]
  onEditEvent?: (event: CalendarEvent) => void
}

export function WeekRow({
  week,
  todayRef,
  isCurrentWeek,
  onPointerDown,
  onPointerMove,
  selectionDates = [],
  onEditEvent,
}: WeekRowProps) {
  const allEvents = useEventsMap()

  // Collect all events for this week's date range
  const weekEvents: LayoutEvent[] = []
  for (const date of week.days) {
    const isoDate = format(date, 'yyyy-MM-dd')
    const dayEvents = allEvents[isoDate] ?? []
    for (const raw of dayEvents) {
      weekEvents.push(raw as unknown as LayoutEvent)
    }
  }

  // Compute slot assignments
  const slotMap = computeSlotLayout(weekEvents, week.weekStart, week.weekEnd)

  // Separate multi-day events (slot 0) for the spanning row
  const multiDayEvents = weekEvents.filter(e => slotMap.get(e.id) === 0) as unknown as CalendarEvent[]

  return (
    <div ref={isCurrentWeek ? todayRef : undefined}>
      {/* Week-range label */}
      <div className="text-[10px] text-gray-400 px-1 pt-1 col-span-7">
        {week.label}
      </div>

      {/* Multi-day row: 7-column grid, h-7, spanning EventCards */}
      <div className="grid grid-cols-7 h-7 relative">
        {multiDayEvents.map(event => {
          const segmentStart = max([parseISO(event.date), week.weekStart])
          const segmentEnd = min([parseISO(event.endDate ?? event.date), week.weekEnd])
          const colStart = getDay(segmentStart) + 1   // CSS grid is 1-indexed
          const colSpan = differenceInCalendarDays(segmentEnd, segmentStart) + 1
          return (
            <div
              key={event.id}
              className="px-0.5 py-0.5"
              style={{ gridColumn: `${colStart} / span ${colSpan}` }}
            >
              <EventCard
                title={event.title}
                colorToken={event.personId}
                isMultiDay={true}
                onEdit={() => onEditEvent?.(event)}
              />
            </div>
          )
        })}
      </div>

      {/* Single-day rows: 7-column grid with DayColumns (slots 1-4) */}
      <div className="grid grid-cols-7">
        {week.days.map((date) => {
          const isoDate = format(date, 'yyyy-MM-dd')
          const dayEvents = (allEvents[isoDate] ?? []) as unknown as CalendarEvent[]
          const isSelected = selectionDates.includes(isoDate)
          return (
            <DayColumn
              key={date.toISOString()}
              date={date}
              events={dayEvents}
              slotMap={slotMap}
              isSelected={isSelected}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
            />
          )
        })}
      </div>
    </div>
  )
}
