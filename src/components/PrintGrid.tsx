import { format } from 'date-fns'
import { isDayWeekend, isDayHoliday, isDayBirthday } from '../lib/dates'
import type { BirthdayEntry, WeekData } from '../lib/dates'
import type { CalendarEvent } from '../lib/people'

interface PrintGridProps {
  weeks: WeekData[]
  eventsMap: Record<string, unknown[]>
  holidays: Record<string, boolean>
  birthdays: BirthdayEntry[]
}

export function PrintGrid({ weeks, eventsMap, holidays, birthdays }: PrintGridProps) {
  return (
    <div className="text-black bg-white">
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
                  className="border-r border-b border-gray-200 p-0.5 text-[9px]"
                  style={bgColor ? { backgroundColor: bgColor } : undefined}
                >
                  <div className="font-semibold mb-0.5">{format(date, 'd')}</div>
                  {birthday && (
                    <div className="text-[8px] leading-tight text-amber-700 mb-0.5">
                      {birthday.name}&apos;s bday
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
    </div>
  )
}
