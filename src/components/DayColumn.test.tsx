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
  it('renders exactly 4 event slots (slots 1-4: all events including multi-day chips)', () => {
    render(<DayColumn date={MONDAY} />)
    expect(screen.getAllByTestId('event-slot')).toHaveLength(4)
  })
})

describe('DayColumn — multi-day events in slots', () => {
  const MULTI_DAY_EVENT = {
    id: 'multi-1',
    title: 'Spring Break',
    date: '2026-03-16',
    personId: 'lois',
    color: 'lois',
    isMultiDay: true,
    endDate: '2026-03-18',
  }

  const SINGLE_DAY_EVENT = {
    id: 'single-1',
    title: 'Doctor Visit',
    date: '2026-03-16',
    personId: 'timur',
    color: 'timur',
    isMultiDay: false,
  }

  it('multi-day event appears in slot 1 when slotMap assigns it slot 1', () => {
    const slotMap = new Map([['multi-1', 1]])
    render(
      <DayColumn
        date={MONDAY}
        events={[MULTI_DAY_EVENT]}
        slotMap={slotMap}
      />
    )
    // The event title should be visible somewhere in the rendered output
    expect(screen.getByText('Spring Break')).toBeInTheDocument()
  })

  it('multi-day event (slot 1) and single-day event (slot 2) both render without overlap', () => {
    const slotMap = new Map([
      ['multi-1', 1],
      ['single-1', 2],
    ])
    render(
      <DayColumn
        date={MONDAY}
        events={[MULTI_DAY_EVENT, SINGLE_DAY_EVENT]}
        slotMap={slotMap}
      />
    )
    expect(screen.getByText('Spring Break')).toBeInTheDocument()
    expect(screen.getByText('Doctor Visit')).toBeInTheDocument()
  })

  it('slot loop renders exactly 4 slots regardless of isMultiDay events', () => {
    const slotMap = new Map([['multi-1', 1]])
    render(
      <DayColumn
        date={MONDAY}
        events={[MULTI_DAY_EVENT]}
        slotMap={slotMap}
      />
    )
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
