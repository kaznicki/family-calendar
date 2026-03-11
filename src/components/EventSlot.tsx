import { useRef, useState } from 'react'
import { EventCard } from './EventCard'
import { EventPopover } from './EventPopover'
import { addEvent, deleteEvent } from '../lib/eventStore'
import type { CalendarEvent } from '../lib/people'

interface EventSlotProps {
  event?: CalendarEvent | null
  date: string           // ISO date: "2026-03-15"
  slotIndex: number
  onPointerDown?: (e: React.PointerEvent, date: string) => void
}

export function EventSlot({ event, date, slotIndex, onPointerDown }: EventSlotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const slotRef = useRef<HTMLDivElement>(null)

  function handleSlotClick() {
    if (!event) setIsOpen(true)
  }

  function handleSave(data: { title: string; personId: string | null; startTime?: string }) {
    if (event) {
      // Edit mode: replace existing event
      deleteEvent(event.date, event.id)
      addEvent({
        ...event,
        title: data.title,
        personId: data.personId,
        color: data.personId,
        startTime: data.startTime,
      })
    } else {
      // Create mode
      addEvent({
        id: crypto.randomUUID(),
        title: data.title,
        date,
        personId: data.personId,
        color: data.personId,
        startTime: data.startTime,
        isMultiDay: false,
      })
    }
    setIsOpen(false)
  }

  function handleDelete() {
    if (event) deleteEvent(event.date, event.id)
    setIsOpen(false)
  }

  return (
    <>
      <div
        ref={slotRef}
        role="gridcell"
        data-testid="event-slot"
        data-slot-index={slotIndex}
        className={['h-7 overflow-hidden', !event ? 'cursor-pointer' : ''].filter(Boolean).join(' ')}
        onClick={handleSlotClick}
        onPointerDown={onPointerDown ? (e) => onPointerDown(e, date) : undefined}
      >
        {event && (
          <EventCard
            title={event.title}
            colorToken={event.personId}
            startTime={event.startTime}
            isMultiDay={event.isMultiDay}
            onEdit={() => setIsOpen(true)}
          />
        )}
      </div>
      <EventPopover
        anchorEl={slotRef.current}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        onDelete={event ? handleDelete : undefined}
        initialValues={event ? { title: event.title, personId: event.personId, startTime: event.startTime } : undefined}
      />
    </>
  )
}
