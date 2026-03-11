---
plan: 02-06
status: complete
---

# Plan 02-06 Summary: Drag-to-Select + Multi-Day Rendering

## What Was Built

1. **`useDragSelect` hook** — pointer capture on pointerDown, threshold 4px to distinguish click vs drag, selection dates computed as sorted interval, body userSelect cleared on pointerUp.

2. **WeekRow multi-day row** — 7-column grid h-7 row at top of each week. Multi-day events (slotMap=0) rendered as `grid-column: {colStart} / span {colSpan}` with week-boundary clamping using `max(event.date, weekStart)` and `min(event.endDate, weekEnd)`.

3. **DayColumn** — changed from 5 slots (0-4) to 4 slots (1-4). Slot 0 now handled by WeekRow's multi-day row. Overflow indicator (+N) for events with slotMap=-1. `isSelected` prop for drag highlight.

4. **CalendarGrid** — uses `useDragSelect()`, threads `handlePointerDown`/`handlePointerMove` down through WeekRow → DayColumn → EventSlot. Opens multi-day EventPopover on drag completion. `handlePointerUp` on scroll container.

## Key Decisions

- Slot count changed 5→4 per DayColumn; tests updated accordingly (35→28 per week)
- `useDragSelect.handlePointerUp` called on scroll container (not individual slots) to handle pointer-capture release properly
- Week boundary clamping uses date-fns `max`/`min` on parsed ISO dates

## Tests

- 53/53 passing, 0 failures, 6 todo (RecurringFooter stubs)
- TypeScript compiles cleanly

## Commits

- `6923de1`: feat(02-06): implement useDragSelect hook
- `9865df1`: feat(02-06): multi-day spanning row, drag wiring, overflow indicator, updated slot counts

## key-files

### created
- src/lib/useDragSelect.ts

### modified
- src/components/WeekRow.tsx
- src/components/DayColumn.tsx
- src/components/EventSlot.tsx
- src/components/CalendarGrid.tsx
