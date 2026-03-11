import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DayColumn } from './DayColumn'

// Use a fixed date to avoid flakiness. March 14, 2026 = Saturday
const SATURDAY = new Date(2026, 2, 14)
const SUNDAY = new Date(2026, 2, 15)
const MONDAY = new Date(2026, 2, 16)

describe('DayColumn — weekend', () => {
  it('Saturday column has bg-weekend-bg class', () => {
    const { container } = render(<DayColumn date={SATURDAY} />)
    expect(container.firstChild).toHaveClass('bg-weekend-bg')
  })

  it('Sunday column has bg-weekend-bg class', () => {
    const { container } = render(<DayColumn date={SUNDAY} />)
    expect(container.firstChild).toHaveClass('bg-weekend-bg')
  })

  it('Monday column does not have weekend class', () => {
    const { container } = render(<DayColumn date={MONDAY} />)
    expect(container.firstChild).not.toHaveClass('bg-weekend-bg')
  })
})

describe('DayColumn — today', () => {
  it("sets data-today=\"true\" on today's column", () => {
    // Use actual today — isDayToday is real
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
