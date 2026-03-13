import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeekRow } from './WeekRow'
import { generateWeeks } from '../lib/dates'

// Use a specific week for determinism
const weeks = generateWeeks(new Date(2026, 2, 10)) // March 10, 2026
const testWeek = weeks[0] // first generated week

describe('WeekRow', () => {
  it('renders exactly 7 event-slot groups (one per day)', () => {
    render(<WeekRow week={testWeek} isCurrentWeek={false} />)
    // Each DayColumn renders 4 slots (1-4); 7 columns × 4 slots = 28 slots total
    expect(screen.getAllByTestId('event-slot')).toHaveLength(28)
  })

  it('renders the week-range label text', () => {
    render(<WeekRow week={testWeek} isCurrentWeek={false} />)
    expect(screen.getByText(testWeek.label)).toBeInTheDocument()
  })

  it('does not render the multi-day spanning row (h-7 grid-cols-7 block is gone)', () => {
    const { container } = render(<WeekRow week={testWeek} isCurrentWeek={false} />)
    // Find any div with both h-7 and grid-cols-7 class — should not exist
    const allDivs = container.querySelectorAll('div')
    const multiDayRowDiv = Array.from(allDivs).find(div =>
      div.className.includes('h-7') && div.className.includes('grid-cols-7')
    )
    expect(multiDayRowDiv).toBeUndefined()
  })
})
