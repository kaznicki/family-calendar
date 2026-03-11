import { useState } from 'react'
import { PEOPLE } from '../lib/people'
import { useRecurringMap } from '../lib/eventStore'
import { recurringMap, ydoc } from '../lib/ydoc'
import { EventPopover } from './EventPopover'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface PopoverState {
  personId: string
  dayOfWeek: number
  anchorEl: HTMLElement | null
  existing?: string
}

export function RecurringFooter() {
  const snapshot = useRecurringMap()
  const [popover, setPopover] = useState<PopoverState | null>(null)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      {/* Scrollable footer content — overflow-auto for narrow screens */}
      <div className="overflow-auto bg-white border-t border-gray-200">
      {/* Header row: empty label cell + 7 day labels */}
      <div className="flex">
        <div className="w-12 shrink-0" />
        {DAY_LABELS.map((day) => (
          <div
            key={day}
            className="flex-1 text-center text-[10px] text-gray-400 py-0.5"
          >
            {day}
          </div>
        ))}
      </div>

      {/* One row per person */}
      {PEOPLE.map((person) => (
        <div
          key={person.id}
          data-testid="person-row"
          style={{ backgroundColor: `var(--color-${person.colorToken})` }}
          className="flex items-center"
        >
          {/* Person label cell — tinted with person color */}
          <div className="w-12 shrink-0 text-[10px] font-medium px-1 truncate">
            {person.label}
          </div>

          {/* 7 day cells */}
          {DAY_LABELS.map((_, dayIndex) => {
            const key = `${person.id}-${dayIndex}`
            const activityLabel = snapshot[key]
            return (
              <div
                key={dayIndex}
                data-testid="recurring-cell"
                className="flex-1 h-6 text-[9px] cursor-pointer border-l border-gray-100 flex items-center px-0.5 truncate hover:bg-black/5"
                onClick={(e) => {
                  setPopover({
                    personId: person.id,
                    dayOfWeek: dayIndex,
                    anchorEl: e.currentTarget,
                    existing: activityLabel,
                  })
                }}
              >
                {activityLabel ?? ''}
              </div>
            )
          })}
        </div>
      ))}

      </div>{/* end overflow-auto */}

      {/* Popover rendered outside overflow-auto so it isn't clipped */}
      {popover && (
        <EventPopover
          anchorEl={popover.anchorEl}
          isOpen={true}
          onClose={() => setPopover(null)}
          initialValues={
            popover.existing
              ? { title: popover.existing, personId: popover.personId }
              : undefined
          }
          onSave={({ title }) => {
            ydoc.transact(() => {
              recurringMap.set(`${popover.personId}-${popover.dayOfWeek}`, title)
            })
            setPopover(null)
          }}
          onDelete={() => {
            ydoc.transact(() => {
              recurringMap.delete(`${popover.personId}-${popover.dayOfWeek}`)
            })
            setPopover(null)
          }}
        />
      )}
    </div>
  )
}
