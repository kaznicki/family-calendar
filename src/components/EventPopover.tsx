import { useEffect, useState } from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
} from '@floating-ui/react'
import { PEOPLE } from '../lib/people'

type AnchorEl = HTMLElement | { getBoundingClientRect(): DOMRect } | null

export interface EventPopoverProps {
  anchorEl: AnchorEl
  isOpen: boolean
  onClose: () => void
  onSave: (data: { title: string; personId: string | null; startTime?: string }) => void
  onDelete?: () => void
  initialValues?: {
    title: string
    personId: string | null
    startTime?: string
  }
}

// All chips: 7 people + 1 unassigned
const ALL_CHIPS = [
  ...PEOPLE.map(p => ({ id: p.id, label: p.label, colorToken: p.colorToken })),
  { id: null as null, label: 'None', colorToken: 'unassigned' },
]

export function EventPopover({
  anchorEl,
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialValues,
}: EventPopoverProps) {
  const [title, setTitle] = useState('')
  const [personId, setPersonId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<string | undefined>(undefined)

  // Sync state from initialValues when popover opens
  useEffect(() => {
    if (isOpen) {
      setTitle(initialValues?.title ?? '')
      setPersonId(initialValues?.personId ?? null)
      setStartTime(initialValues?.startTime)
    }
  }, [isOpen, initialValues])

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => { if (!open) onClose() },
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  // Sync external anchor element as floating reference
  useEffect(() => {
    refs.setReference(anchorEl)
  }, [anchorEl, refs])

  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'dialog' })
  const { getFloatingProps } = useInteractions([dismiss, role])

  function handleSave() {
    if (!title.trim()) return
    onSave({ title: title.trim(), personId, startTime })
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <FloatingFocusManager context={context} modal={false}>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
        className="bg-white rounded-lg shadow-lg p-3 w-64 flex flex-col gap-2 z-50"
      >
        {/* Title input */}
        <input
          type="text"
          placeholder="Event name"
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        />

        {/* Color chips */}
        <div className="flex flex-wrap gap-1">
          {ALL_CHIPS.map(chip => {
            const isSelected = personId === chip.id
            return (
              <button
                key={chip.id ?? '__unassigned__'}
                type="button"
                data-color={chip.id ?? 'unassigned'}
                onClick={() => setPersonId(chip.id)}
                style={{ backgroundColor: `var(--color-${chip.colorToken})` }}
                className={[
                  'text-xs px-1.5 py-0.5 rounded truncate max-w-[80px]',
                  isSelected ? 'ring-2 ring-offset-1 ring-gray-700' : '',
                ].filter(Boolean).join(' ')}
              >
                {chip.label}
              </button>
            )
          })}
        </div>

        {/* Optional time input */}
        <input
          type="time"
          placeholder="Time (optional)"
          value={startTime ?? ''}
          onChange={e => setStartTime(e.target.value || undefined)}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        />

        {/* Action row */}
        <div className="flex gap-2 justify-end">
          {onDelete && (
            <button
              type="button"
              onClick={() => { onDelete(); onClose() }}
              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </FloatingFocusManager>
  )
}
