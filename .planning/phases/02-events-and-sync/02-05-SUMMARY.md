---
plan: 02-05
status: complete
---

# Plan 02-05 Summary: EventPopover + Full Single-Day CRUD

## What Was Built

1. **EventPopover** — Floating UI-anchored create/edit popover. Title input, 8 color chips (7 people + unassigned), optional time input, Save/Delete buttons. `useDismiss` for outside-click close. `FloatingFocusManager` for focus trap. 8/8 tests passing.

2. **EventSlot** — Updated to accept `event?`, `date`, `slotIndex`, `onPointerDown?` props. Empty slot → click to create; event present → EventCard with click-to-edit. Save calls `addEvent`; delete calls `deleteEvent`.

3. **DayColumn** — Accepts `events[]` and `slotMap` (both optional with defaults for backwards compatibility). Maps each slot 0–4 to the event whose `slotMap` value matches.

4. **WeekRow** — Now subscribes to `useEventsMap()` (useSyncExternalStore, no useEffect+setState). Calls `computeSlotLayout(weekEvents, weekStart, weekEnd)` to get slotMap. Passes events + slotMap down to each DayColumn.

## Key Decisions

- `DayColumn.events` and `.slotMap` are optional (with defaults) so existing tests don't break
- Outside-click test uses `fireEvent.pointerDown` (not `mouseDown`) — Floating UI `useDismiss` uses pointerdown events
- `WeekRow` uses React 19 `useSyncExternalStore` pattern via `useEventsMap` — no useEffect+setState

## Tests

- 53/53 passing, 6 todo (RecurringFooter stubs), 0 failures
- TypeScript compiles cleanly

## Commits

- `4cb4f4e`: feat(02-05): implement EventPopover with Floating UI — 8 tests passing
- `3c70757`: feat(02-05): wire EventSlot+DayColumn+WeekRow — event CRUD, slot layout, useEventsMap

## key-files

### modified
- src/components/EventPopover.tsx
- src/components/EventPopover.test.tsx
- src/components/EventSlot.tsx
- src/components/DayColumn.tsx
- src/components/WeekRow.tsx
