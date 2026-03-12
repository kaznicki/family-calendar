import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DayColumn } from './DayColumn'
import type { BirthdayEntry } from '../lib/dates'

// Mock heavy dependencies to keep test scope tight
vi.mock('./HolidayMenu', () => ({
  HolidayMenu: () => null,
}))

vi.mock('../lib/useLongPress', () => ({
  useLongPress: () => ({
    onPointerDown: vi.fn(),
    onPointerUp: vi.fn(),
    onPointerLeave: vi.fn(),
    onContextMenu: vi.fn(),
  }),
}))

// Use a fixed date to avoid flakiness. March 14, 2026 = Saturday
const SATURDAY = new Date(2026, 2, 14)
const SUNDAY = new Date(2026, 2, 15)
const MONDAY = new Date(2026, 2, 16)

const BIRTHDAY_JOY: BirthdayEntry = { id: 'joy', name: 'Joy', month: 3, day: 16 }

describe('DayColumn — weekend', () => {
  it('Saturday column has weekend bg via inline style', () => {
    const { container } = render(<DayColumn date={SATURDAY} />)
    expect((container.firstChild as HTMLElement).style.backgroundColor).toBe('var(--color-weekend-bg)')
  })

  it('Sunday column has weekend bg via inline style', () => {
    const { container } = render(<DayColumn date={SUNDAY} />)
    expect((container.firstChild as HTMLElement).style.backgroundColor).toBe('var(--color-weekend-bg)')
  })

  it('Monday column does not have weekend bg', () => {
    const { container } = render(<DayColumn date={MONDAY} />)
    expect((container.firstChild as HTMLElement).style.backgroundColor).not.toBe('var(--color-weekend-bg)')
  })
})

describe('DayColumn — today', () => {
  it("sets data-today=\"true\" on today's column", () => {
    const { container } = render(<DayColumn date={new Date()} />)
    expect(container.firstChild).toHaveAttribute('data-today', 'true')
  })

  it('does not set data-today on a non-today date', () => {
    const { container } = render(<DayColumn date={MONDAY} />)
    expect(container.firstChild).not.toHaveAttribute('data-today')
  })
})

describe('DayColumn — slots', () => {
  it('renders exactly 4 event slots (slots 1-4; slot 0 is multi-day row in WeekRow)', () => {
    render(<DayColumn date={MONDAY} />)
    expect(screen.getAllByTestId('event-slot')).toHaveLength(4)
  })
})

describe('DayColumn — holiday background', () => {
  it('isHoliday=true applies var(--color-weekend-bg) via inline style', () => {
    const { container } = render(<DayColumn date={MONDAY} isHoliday={true} />)
    expect((container.firstChild as HTMLElement).style.backgroundColor).toBe('var(--color-weekend-bg)')
  })

  it('isHoliday=false on a weekday has no holiday bg', () => {
    const { container } = render(<DayColumn date={MONDAY} isHoliday={false} />)
    expect((container.firstChild as HTMLElement).style.backgroundColor).not.toBe('var(--color-weekend-bg)')
  })
})

describe('DayColumn — birthday background and label', () => {
  it('isBirthday applies var(--color-birthday-bg) via inline style', () => {
    const { container } = render(<DayColumn date={MONDAY} isBirthday={BIRTHDAY_JOY} />)
    expect((container.firstChild as HTMLElement).style.backgroundColor).toBe('var(--color-birthday-bg)')
  })

  it('isBirthday + isHoliday: birthday wins (gold, not gray)', () => {
    const { container } = render(<DayColumn date={MONDAY} isBirthday={BIRTHDAY_JOY} isHoliday={true} />)
    expect((container.firstChild as HTMLElement).style.backgroundColor).toBe('var(--color-birthday-bg)')
  })

  it('isBirthday renders label containing the birthday name', () => {
    render(<DayColumn date={MONDAY} isBirthday={BIRTHDAY_JOY} />)
    expect(screen.getByText("Joy's bday")).toBeInTheDocument()
  })

  it('slot count remains 4 when isBirthday is set', () => {
    render(<DayColumn date={MONDAY} isBirthday={BIRTHDAY_JOY} />)
    expect(screen.getAllByTestId('event-slot')).toHaveLength(4)
  })
})
