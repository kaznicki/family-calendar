import { render, screen, fireEvent } from '@testing-library/react'
import { RecurringFooter } from './RecurringFooter'

// Mock useRecurringMap to return controlled data
vi.mock('../lib/eventStore', () => ({
  useRecurringMap: () => ({
    'timur-1': 'Capital Planning',  // Monday
    'lois-3': 'Yoga',               // Wednesday
  }),
  useEventsMap: () => ({}),
}))

describe('RecurringFooter', () => {
  it('renders one row per person (default 7 people)', () => {
    render(<RecurringFooter />)
    // Each person has a row with their label
    expect(screen.getByText('Dad')).toBeInTheDocument()
    expect(screen.getByText('Mom')).toBeInTheDocument()
    expect(screen.getByText('Sophia')).toBeInTheDocument()
  })

  it('renders 7 columns (one per day of week, Sun-Sat)', () => {
    const { container } = render(<RecurringFooter />)
    // 7 people x 7 days = 49 day cells (plus person label cells = 56 cells total)
    // Check that the grid structure exists
    const dayCells = container.querySelectorAll('[data-testid="recurring-cell"]')
    expect(dayCells).toHaveLength(49)  // 7 people x 7 days
  })

  it('each row is tinted with the person color token via inline style', () => {
    render(<RecurringFooter />)
    const timurRow = screen.getByText('Dad').closest('[data-testid="person-row"]')
    expect(timurRow).toHaveStyle({ backgroundColor: 'var(--color-timur)' })
  })

  it('shows activity label for cells with recurring entries', () => {
    render(<RecurringFooter />)
    expect(screen.getByText('Capital Planning')).toBeInTheDocument()
    expect(screen.getByText('Yoga')).toBeInTheDocument()
  })

  it('clicking a cell with an existing entry opens an edit popover', () => {
    render(<RecurringFooter />)
    const capitalPlanningCell = screen.getByText('Capital Planning').closest('[data-testid="recurring-cell"]')!
    fireEvent.click(capitalPlanningCell)
    // Popover text input should appear
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('clicking an empty cell opens a create popover for that person/day', () => {
    render(<RecurringFooter />)
    // Get first empty cell (Timur Sunday = 'timur-0', which is empty in our mock)
    const emptyCells = screen.getAllByTestId('recurring-cell').filter(
      (cell) => cell.textContent?.trim() === ''
    )
    fireEvent.click(emptyCells[0])
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})

describe('RecurringFooter — RDBL-03 day header typography', () => {
  it('day header cells have class text-xs', () => {
    const { container } = render(<RecurringFooter />)
    // Header row is the first flex div; day cells are its children after the empty spacer div
    const headerRow = container.querySelector('.overflow-auto > .flex')
    const dayCells = headerRow ? Array.from(headerRow.querySelectorAll('.flex-1')) : []
    expect(dayCells.length).toBeGreaterThan(0)
    dayCells.forEach(cell => expect(cell.className).toContain('text-xs'))
  })

  it('day header cells have class font-semibold', () => {
    const { container } = render(<RecurringFooter />)
    const headerRow = container.querySelector('.overflow-auto > .flex')
    const dayCells = headerRow ? Array.from(headerRow.querySelectorAll('.flex-1')) : []
    dayCells.forEach(cell => expect(cell.className).toContain('font-semibold'))
  })

  it('day header cells have class text-gray-600', () => {
    const { container } = render(<RecurringFooter />)
    const headerRow = container.querySelector('.overflow-auto > .flex')
    const dayCells = headerRow ? Array.from(headerRow.querySelectorAll('.flex-1')) : []
    dayCells.forEach(cell => expect(cell.className).toContain('text-gray-600'))
  })
})
