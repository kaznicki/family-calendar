import { render, screen, fireEvent } from '@testing-library/react'
import { EventCard } from './EventCard'

describe('EventCard', () => {
  it('renders event title text', () => {
    render(<EventCard title="Doctor appointment" colorToken="lois" onEdit={() => {}} />)
    expect(screen.getByText('Doctor appointment')).toBeInTheDocument()
  })

  it('applies bg-{personId} class matching the person color token', () => {
    const { container } = render(<EventCard title="Test" colorToken="lois" onEdit={() => {}} />)
    expect(container.firstChild).toHaveClass('bg-lois')
    expect(container.firstChild).not.toHaveClass('bg-[--color-lois]')
  })

  it('applies bg-unassigned when colorToken is null', () => {
    const { container } = render(<EventCard title="Test" colorToken={null} onEdit={() => {}} />)
    expect(container.firstChild).toHaveClass('bg-unassigned')
  })

  it('renders startTime when provided', () => {
    render(<EventCard title="Test" colorToken="timur" startTime="14:30" onEdit={() => {}} />)
    expect(screen.getByText('14:30')).toBeInTheDocument()
  })

  it('does not render time text when startTime is undefined', () => {
    render(<EventCard title="Test" colorToken="timur" onEdit={() => {}} />)
    expect(screen.queryByText(/\d{1,2}:\d{2}/)).not.toBeInTheDocument()
  })

  it('clicking EventCard calls onEdit callback', () => {
    const onEdit = vi.fn()
    render(<EventCard title="Test" colorToken="lois" onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onEdit).toHaveBeenCalledOnce()
  })
})
