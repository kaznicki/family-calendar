import { render, screen, fireEvent } from '@testing-library/react'
import { EventCard } from './EventCard'

describe('EventCard', () => {
  it('renders event title text', () => {
    render(<EventCard title="Doctor appointment" colorToken="lois" onEdit={() => {}} />)
    expect(screen.getByText('Doctor appointment')).toBeInTheDocument()
  })

  it('applies inline background-color style for person color token', () => {
    const { container } = render(<EventCard title="Test" colorToken="lois" onEdit={() => {}} />)
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'var(--color-lois)' })
  })

  it('applies bg-unassigned inline style when colorToken is null', () => {
    const { container } = render(<EventCard title="Test" colorToken={null} onEdit={() => {}} />)
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'var(--color-unassigned)' })
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

  it('renders left border marker when isMultiDay=true', () => {
    const { container } = render(<EventCard title="Multi" colorToken="lois" isMultiDay={true} onEdit={() => {}} />)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toMatch(/border-l-2/)
  })

  it('does not render left border marker when isMultiDay is false', () => {
    const { container } = render(<EventCard title="Single" colorToken="lois" isMultiDay={false} onEdit={() => {}} />)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).not.toMatch(/border-l-2/)
  })

  it('does not render left border marker when isMultiDay is undefined (regression)', () => {
    const { container } = render(<EventCard title="Single" colorToken="lois" onEdit={() => {}} />)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).not.toMatch(/border-l-2/)
  })
})
