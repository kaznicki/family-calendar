import { useEffect, useRef, useMemo, useState } from 'react'
import { isThisWeek } from 'date-fns'
import { generateWeeks } from '../lib/dates'
import { WeekRow } from './WeekRow'
import { EventPopover } from './EventPopover'
import { RecurringFooter } from './RecurringFooter'
import { addEvent } from '../lib/eventStore'
import { useDragSelect } from '../lib/useDragSelect'

// Day names for the sticky header strip
// Desktop: full names; Mobile: single letters via responsive classes
const DAY_NAMES_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function CalendarGrid() {
  // Generate weeks once — memoized so they don't regenerate on every render
  const weeks = useMemo(() => generateWeeks(), [])

  // Ref attached to the current week's WeekRow for scroll-to-today on mount
  const todayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll current week to top of viewport on initial mount.
    // behavior: 'instant' (not 'smooth') — avoids disorienting flash on load.
    todayRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, []) // Empty deps: run once on mount only

  // Drag-to-select for multi-day event creation
  const { dragState, handlePointerDown, handlePointerMove, handlePointerUp, selectionDates } = useDragSelect()

  // Multi-day popover state (opened after a completed drag)
  const [multiDayPopover, setMultiDayPopover] = useState<{
    startDate: string
    endDate: string
    x: number
    y: number
  } | null>(null)

  function handlePointerUpOnGrid(e: React.PointerEvent<HTMLElement>) {
    const result = handlePointerUp(e)
    if (result.type === 'drag') {
      setMultiDayPopover({
        startDate: result.startDate,
        endDate: result.endDate,
        x: e.clientX,
        y: e.clientY,
      })
    }
    // 'click' type is handled by EventSlot's own onClick
  }

  return (
    // Outer container: full viewport height, no overflow (scroll div handles scroll)
    <div className="flex flex-col h-screen overflow-hidden">

      {/* Scrollable body — takes full flex space; contains both sticky header and week rows */}
      {/* overflow-y: auto here; NO overflow: hidden on any ancestor */}
      {/* pb-28: prevents last calendar week from being hidden behind the fixed RecurringFooter */}
      <div
        className="overflow-y-auto flex-1 pb-28"
        onPointerUp={dragState.active ? handlePointerUpOnGrid : undefined}
      >
        {/* Sticky day-name header strip — INSIDE scroll container so it shares the same width */}
        {/* Both header and WeekRows have the same container width → columns can't drift */}
        {/* align-self: start is critical — prevents CSS Grid stretch from breaking sticky */}
        <div
          className="grid grid-cols-7 sticky top-0 z-10 bg-white border-b border-gray-100"
          style={{ alignSelf: 'start' }}
        >
          {DAY_NAMES_SHORT.map((short, i) => (
            <div key={i} className="text-center py-2">
              {/* Short on mobile (always visible), full on sm+ */}
              <span className="sm:hidden text-[11px] text-gray-500 font-medium">{short}</span>
              <span className="hidden sm:inline text-xs text-gray-500 font-medium">{DAY_NAMES_FULL[i]}</span>
            </div>
          ))}
        </div>

        {/* Week rows follow immediately in the same container */}
        {weeks.map((week) => (
          <WeekRow
            key={week.weekStart.toISOString()}
            week={week}
            todayRef={todayRef}
            isCurrentWeek={isThisWeek(week.weekStart, { weekStartsOn: 0 })}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            selectionDates={selectionDates}
          />
        ))}
      </div>

      {/* Recurring schedule footer — fixed at bottom of viewport, outside scroll area */}
      <RecurringFooter />

      {/* Multi-day create popover (opened after drag completes) */}
      {multiDayPopover && (
        <EventPopover
          anchorEl={{
            getBoundingClientRect: () => DOMRect.fromRect({
              x: multiDayPopover.x, y: multiDayPopover.y, width: 0, height: 0,
            }),
          }}
          isOpen={true}
          onClose={() => setMultiDayPopover(null)}
          onSave={(data) => {
            addEvent({
              id: crypto.randomUUID(),
              title: data.title,
              date: multiDayPopover.startDate,
              endDate: multiDayPopover.endDate,
              isMultiDay: true,
              personId: data.personId,
              color: data.personId,
              startTime: data.startTime,
            })
            setMultiDayPopover(null)
          }}
        />
      )}
    </div>
  )
}
