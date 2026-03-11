import { render, screen, fireEvent } from '@testing-library/react'
import { EventPopover } from './EventPopover'

// anchorEl helper — jsdom doesn't need a real positioned element for behavior tests
function makeAnchor() {
  return document.createElement('div')
}

const noop = () => {}

describe('EventPopover', () => {
  it('renders a text input for event title', () => {
    render(<EventPopover anchorEl={makeAnchor()} isOpen={true} onClose={noop} onSave={noop} />)
    expect(screen.getByPlaceholderText('Event name')).toBeInTheDocument()
  })

  it('renders 8 color chip buttons (7 people + unassigned)', () => {
    render(<EventPopover anchorEl={makeAnchor()} isOpen={true} onClose={noop} onSave={noop} />)
    // 7 PEOPLE + 1 unassigned = 8 chips, identified by data-color attribute
    const chips = document.querySelectorAll('[data-color]')
    expect(chips).toHaveLength(8)
  })

  it('pressing Enter submits and calls onSave with title and personId', () => {
    const onSave = vi.fn()
    render(<EventPopover anchorEl={makeAnchor()} isOpen={true} onClose={noop} onSave={onSave} />)
    const input = screen.getByPlaceholderText('Event name')
    fireEvent.change(input, { target: { value: 'Doctor visit' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSave).toHaveBeenCalledWith({ title: 'Doctor visit', personId: null, startTime: undefined })
  })

  it('clicking a color chip selects that personId', () => {
    const onSave = vi.fn()
    render(<EventPopover anchorEl={makeAnchor()} isOpen={true} onClose={noop} onSave={onSave} />)
    const input = screen.getByPlaceholderText('Event name')
    fireEvent.change(input, { target: { value: 'Test event' } })
    // Click the 'lois' chip
    const loisChip = document.querySelector('[data-color="lois"]') as HTMLElement
    fireEvent.click(loisChip)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSave).toHaveBeenCalledWith({ title: 'Test event', personId: 'lois', startTime: undefined })
  })

  it('clicking outside the popover calls onClose', () => {
    const onClose = vi.fn()
    render(<EventPopover anchorEl={makeAnchor()} isOpen={true} onClose={onClose} onSave={noop} />)
    // Floating UI useDismiss listens for pointerdown outside the floating element
    fireEvent.pointerDown(document.body)
    expect(onClose).toHaveBeenCalled()
  })

  it('initialValues pre-fill the title input and highlight current personId chip', () => {
    render(
      <EventPopover
        anchorEl={makeAnchor()}
        isOpen={true}
        onClose={noop}
        onSave={noop}
        initialValues={{ title: 'Pre-filled', personId: 'joy' }}
      />
    )
    expect(screen.getByDisplayValue('Pre-filled')).toBeInTheDocument()
    const joyChip = document.querySelector('[data-color="joy"]') as HTMLElement
    expect(joyChip).toHaveClass('ring-2')
  })

  it('delete button calls onDelete when initialValues provided', () => {
    const onDelete = vi.fn()
    render(
      <EventPopover
        anchorEl={makeAnchor()}
        isOpen={true}
        onClose={noop}
        onSave={noop}
        onDelete={onDelete}
        initialValues={{ title: 'Existing event', personId: null }}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalled()
  })

  it('delete button is NOT present when no initialValues (create mode)', () => {
    render(<EventPopover anchorEl={makeAnchor()} isOpen={true} onClose={noop} onSave={noop} />)
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })
})
