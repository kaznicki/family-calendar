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
    expect(screen.getByText('Timur')).toBeInTheDocument()
    expect(screen.getByText('Lois')).toBeInTheDocument()
    expect(screen.getByText('Ivy')).toBeInTheDocument()
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
    const timurRow = screen.getByText('Timur').closest('[data-testid="person-row"]')
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
