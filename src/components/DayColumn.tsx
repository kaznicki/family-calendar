import { useState } from 'react'
import { isDayWeekend, isDayToday } from '../lib/dates'
import type { BirthdayEntry } from '../lib/dates'
import { EventSlot } from './EventSlot'
import { HolidayMenu } from './HolidayMenu'
import { markHoliday, unmarkHoliday } from '../lib/eventStore'
import { useLongPress } from '../lib/useLongPress'
import { format } from 'date-fns'
import type { CalendarEvent } from '../lib/people'

interface DayColumnProps {
  date: Date
  events?: CalendarEvent[]
  slotMap?: Map<string, number>
  isSelected?: boolean
  onPointerDown?: (e: React.PointerEvent<HTMLElement>, date: string) => void
  onPointerMove?: (e: React.PointerEvent<HTMLElement>, date: string) => void
  isHoliday?: boolean
  isBirthday?: BirthdayEntry
  onEditEvent?: (event: CalendarEvent) => void
}

export function DayColumn({
  date,
  events = [],
  slotMap = new Map(),
  isSelected = false,
  onPointerDown,
  onPointerMove,
  isHoliday = false,
  isBirthday,
  onEditEvent: _onEditEvent,
}: DayColumnProps) {
  const isWeekend = isDayWeekend(date)
  const isToday = isDayToday(date)
  const isoDate = format(date, 'yyyy-MM-dd')

  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })

  const longPress = useLongPress(() => { setMenuOpen(true) })

  // Count overflow events for this date
  const overflowCount = events.filter(e => slotMap.get(e.id) === -1).length

  // Background color priority: birthday (gold) > holiday/weekend (gray) > today (blue) > none
  const bgColor = isBirthday
    ? 'var(--color-birthday-bg)'
    : (isHoliday || isWeekend)
    ? 'var(--color-weekend-bg)'
    : isToday
    ? 'var(--color-today-bg)'
    : undefined

  return (
    <div
      data-today={isToday ? 'true' : undefined}
      className={[
        'flex flex-col min-w-0',
        !bgColor && isSelected ? 'bg-blue-50' : '',
      ].filter(Boolean).join(' ')}
      style={{ backgroundColor: bgColor }}
      onContextMenu={(e) => {
        e.preventDefault()
        setMenuPos({ x: e.clientX, y: e.clientY })
        setMenuOpen(true)
      }}
    >
      {/* Date number header with long-press support (mobile) */}
      <div
        onPointerDown={longPress.onPointerDown}
        onPointerUp={longPress.onPointerUp}
        onPointerLeave={longPress.onPointerLeave}
        className={[
          'text-center text-xs py-0.5 leading-none select-none',
          isToday ? 'font-semibold text-blue-600' : 'text-gray-500',
        ].join(' ')}
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' } as React.CSSProperties}
      >
        {format(date, 'd')}
      </div>

      {/* Birthday label (above slot rows, not consuming a slot) */}
      {isBirthday && (
        <div className="text-[9px] text-amber-700 text-center leading-none pb-0.5 truncate px-0.5">
          {isBirthday.name}'s bday
        </div>
      )}

      {/* Slots 1-4: all events including multi-day chips */}
      {Array.from({ length: 4 }, (_, i) => {
        const slotIndex = i + 1
        const ev = events.find(e =>
          slotMap.get(e.id) === slotIndex &&
          isoDate >= e.date &&
          isoDate <= (e.endDate ?? e.date)
        ) ?? null
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

      {/* Holiday context menu */}
      {menuOpen && (
        <HolidayMenu
          isHoliday={!!isHoliday}
          onMark={() => markHoliday(isoDate)}
          onUnmark={() => unmarkHoliday(isoDate)}
          onClose={() => setMenuOpen(false)}
          anchorPos={menuPos}
        />
      )}
    </div>
  )
}
