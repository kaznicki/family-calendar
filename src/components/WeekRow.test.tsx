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
    // Each DayColumn renders 4 slots (1-4); slot 0 is multi-day row in WeekRow
    // 7 columns × 4 slots = 28 slots total
    expect(screen.getAllByTestId('event-slot')).toHaveLength(28)
  })

  it('renders the week-range label text', () => {
    render(<WeekRow week={testWeek} isCurrentWeek={false} />)
    expect(screen.getByText(testWeek.label)).toBeInTheDocument()
  })
})
