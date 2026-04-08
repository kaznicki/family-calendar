import { format } from 'date-fns'
import { isDayWeekend, isDayHoliday, isDayBirthday } from '../lib/dates'
import type { BirthdayEntry, WeekData } from '../lib/dates'
import type { CalendarEvent } from '../lib/people'
import { PEOPLE } from '../lib/people'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface PrintGridProps {
  weeks: WeekData[]
  eventsMap: Record<string, unknown[]>
  holidays: Record<string, boolean>
  birthdays: BirthdayEntry[]
  recurring: Record<string, string>
}

export function PrintGrid({ weeks, eventsMap, holidays, birthdays, recurring }: PrintGridProps) {
  return (
    <div className="text-black bg-white">

      {/* Day-of-week header row */}
      <div className="print-week-grid mb-0.5">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="border-r border-b border-gray-300 p-0.5 text-[9px] font-semibold text-gray-600 text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week) => (
        <div key={week.weekStart.toISOString()} className="print-week-row">
          <div className="print-week-label">{week.label}</div>
          <div className="print-week-grid">
            {week.days.map((date) => {
              const isoDate = format(date, 'yyyy-MM-dd')
              const birthday = isDayBirthday(date, birthdays)
              const holiday = isDayHoliday(isoDate, holidays)
              const weekend = isDayWeekend(date)
              const bgColor = birthday
                ? 'var(--color-birthday-bg)'
                : holiday || weekend
                ? 'var(--color-weekend-bg)'
                : undefined
              const dayEvents = (eventsMap[isoDate] ?? []) as unknown as CalendarEvent[]

              return (
                <div
                  key={isoDate}
                  className="border-r border-b border-gray-200 p-0.5 text-[9px] min-h-[70px]"
                  style={bgColor ? { backgroundColor: bgColor } : undefined}
                >
                  <div className="font-semibold mb-0.5">{format(date, 'd')}</div>
                  {birthday && (
                    <div className="text-[8px] leading-tight text-amber-700 mb-0.5">
                      {birthday.name}
                    </div>
                  )}
                  {dayEvents.slice(0, 4).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[8px] leading-tight px-0.5 truncate rounded-sm mb-0.5"
                      style={{ backgroundColor: `var(--color-${ev.personId})` }}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Recurring schedule footer */}
      <div className="mt-2 border-t border-gray-400 pt-1">
        {/* Day-name header */}
        <div className="flex">
          <div className="w-12 shrink-0" />
          {DAY_NAMES.map((day) => (
            <div key={day} className="flex-1 text-center text-[9px] font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        {/* One row per person */}
        {PEOPLE.map((person) => (
          <div
            key={person.id}
            className="flex items-center"
            style={{ backgroundColor: `var(--color-${person.colorToken})` }}
          >
            <div className="w-12 shrink-0 text-[8px] font-medium px-1 truncate">
              {person.label}
            </div>
            {DAY_NAMES.map((_, dayIndex) => {
              const activity = recurring[`${person.id}-${dayIndex}`]
              return (
                <div
                  key={dayIndex}
                  className="flex-1 text-[8px] border-l border-gray-200 px-0.5 truncate"
                >
                  {activity ?? ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>

    </div>
  )
}
