import type { WeekData, BirthdayEntry } from '../lib/dates'
import { isDayHoliday, isDayBirthday } from '../lib/dates'
import { DayColumn } from './DayColumn'
import { useEventsMap, useHolidaysMap, useBirthdaysMap } from '../lib/eventStore'
import { computeSlotLayout } from '../lib/slotLayout'
import type { LayoutEvent } from '../lib/slotLayout'
import { format } from 'date-fns'
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
  const holidays = useHolidaysMap()
  const birthdaysRaw = useBirthdaysMap()
  const birthdays: BirthdayEntry[] = Object.values(birthdaysRaw).map(v => JSON.parse(v) as BirthdayEntry)

  // Collect all events for this week's date range (by start date)
  const weekEvents: LayoutEvent[] = []
  for (const date of week.days) {
    const isoDate = format(date, 'yyyy-MM-dd')
    const dayEvents = allEvents[isoDate] ?? []
    for (const raw of dayEvents) {
      weekEvents.push(raw as unknown as LayoutEvent)
    }
  }

  // Compute slot assignments — multi-day events now occupy real slots 1-4
  const slotMap = computeSlotLayout(weekEvents, week.weekStart, week.weekEnd)

  return (
    <div ref={isCurrentWeek ? todayRef : undefined}>
      {/* Week-range label */}
      <div className="text-sm font-semibold text-gray-700 px-1 pt-1">
        {week.label}
      </div>

      {/* Day columns: 7-column grid with DayColumns (slots 1-4 for all events including multi-day) */}
      <div className="grid grid-cols-7">
        {week.days.map((date) => {
          const isoDate = format(date, 'yyyy-MM-dd')
          const isSelected = selectionDates.includes(isoDate)
          return (
            <DayColumn
              key={date.toISOString()}
              date={date}
              events={weekEvents as unknown as CalendarEvent[]}
              slotMap={slotMap}
              isSelected={isSelected}
              isHoliday={isDayHoliday(isoDate, holidays)}
              isBirthday={isDayBirthday(date, birthdays)}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onEditEvent={onEditEvent}
            />
          )
        })}
      </div>
    </div>
  )
}
