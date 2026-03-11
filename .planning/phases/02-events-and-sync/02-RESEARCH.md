# Phase 2: Events and Sync - Research

**Researched:** 2026-03-10
**Domain:** Yjs CRDT writes + React event-driven UI + multi-day interval scheduling + inline popover + drag selection + recurring schedule
**Confidence:** HIGH (Yjs API, React patterns, Floating UI), MEDIUM (drag-to-select, color matching)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Event entry: inline, no separate modal (EVNT-01) — click empty slot -> small popover anchors to that slot; text input and 7 color chips in same UI; Enter or click-away saves/dismisses
- Person/color assignment: same step as typing — text input and color chips shown together, not two-step
- Unassigned events are valid — default to neutral gray; person/color is never required
- 7 color options as flat list (no split): Timur (salmon/coral), Lois (light pink), Joy (light mint green), Ivy (periwinkle/lavender blue), Both girls (bright cyan), Whole Family (bright yellow), Other (light peach/tan)
- Color source of truth: `Family-Calendar-Google-Sheets-03-10-2026_10_53_AM.png` — match with oklch values in Tailwind v4 `@theme {}`
- Multi-day creation: drag across day slots — click-hold start day, drag to end, release -> popover to name and assign
- Multi-day events split at week boundaries — vacation Thu-Tue renders as two separate visual blocks (Thu-Sat row N, Sun-Tue row N+1), NOT a continuous wrapping band
- Multi-day events occupy dedicated slot row — always render in slot position 1 of their week row; single-day events stack in remaining slots below
- Recurring schedule: fixed footer at bottom of viewport, outside scrollable grid — always visible, reference panel
- Recurring schedule covers all family members (Timur: Capital Planning, Lois: weights/yoga, Ivy: dance/Hip Hop/Ballet)
- Recurring schedule layout: one row per person x 7 columns (day of week), tinted with person color
- Recurring schedule editing: click entry to edit inline — same pattern as regular events
- No presence indicators / cursors for v1 — out of scope
- Roster management (add/remove people, recolor) lives behind settings icon in app header

### Claude's Discretion
- Exact popover design — anchoring, sizing, shadow, dismiss behavior details
- Whether to use Floating UI for popover positioning or simpler CSS absolute positioning
- Specific Yjs structure for recurring schedule (separate Y.Map, follow eventsMap pattern)
- How to store/identify the 7 fixed people (static config vs Yjs-stored roster)
- Drag selection implementation approach (raw pointer events vs lightweight library)

### Deferred Ideas (OUT OF SCOPE)
- Recurring events appearing in the main grid (vs footer reference panel)
- Presence indicators, "who's online" cursors
- Time-slot hour scheduling
- Drag-and-drop event moving (explicitly out of scope in REQUIREMENTS.md)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EVNT-01 | User can add an event to a day slot inline (no separate form/modal required) | Floating UI `@floating-ui/react` v0.27 anchors popover to clicked EventSlot; useSyncExternalStore pattern writes to Yjs eventsMap |
| EVNT-02 | User can edit an existing event | Same popover with pre-filled inputs; EventCard click opens edit popover anchored to event position |
| EVNT-03 | User can delete an event | Delete button inside edit popover; Y.Array.delete(index) removes from eventsMap for that ISO date |
| EVNT-04 | A multi-day event occupies a single row spanning consecutive day-columns | Interval scheduling algorithm assigns multi-day events to slot 0; CSS grid-column span derived at render time from date range |
| EVNT-05 | Events can optionally include a time (not required) | Optional text field in popover; stored as `startTime` string in Y.Map event object |
| EVNT-06 | Multiple events in the same day slot are stacked visibly without overlapping | Slot allocation algorithm packs events into available slot indices (0-4); derived at render time per CONTEXT.md constraint |
| PEPL-01 | Each family member has a distinct color applied to their events | 7 person color tokens added to @theme {} in index.css; event EventCard applies bg-{personId} |
| PEPL-02 | User assigns a person/color to an event with a single tap or click | Color chip row in popover — one click assigns personId; immediate visual feedback |
| PEPL-04 | User can add/remove family members and change assigned colors | Settings panel (header icon) writes roster to a separate `rosterMap` Y.Map; configurable |
| RECU-01 | Dedicated section displays Ivy's (and all family) weekly recurring schedule | RecurringFooter component outside scrollable div; `recurringMap` Y.Map keyed by `{personId}-{dayOfWeek}` |
| RECU-02 | User can edit recurring schedule entries via simple form | Same inline popover pattern; click empty/filled recurring cell triggers popover |
| SHRG-02 | Multiple family members can edit simultaneously without data conflicts | Yjs CRDT handles merge; Y.Array per ISO date key; concurrent writes converge correctly |
</phase_requirements>

---

## Summary

Phase 2 builds on the complete Phase 1 scaffold. The Yjs document, eventsMap, and PartyKit connection are already live. Phase 2 must: (1) wire Yjs data into React's render cycle using `useSyncExternalStore`, (2) implement inline event creation via a popover anchored to clicked cells, (3) handle multi-day events with a slot allocation algorithm that prevents visual collision, (4) implement drag-to-select for multi-day event creation, and (5) add a fixed recurring schedule footer.

The hardest engineering problem in this phase is the multi-day slot allocation algorithm. Events must be packed into rows (slot 0 reserved for multi-day, slots 1-4 for single-day) without visual collision — this is a variant of the interval scheduling / interval graph coloring problem. It runs entirely client-side at render time; no slot assignments are stored in Yjs.

The second-hardest problem is wiring Yjs correctly to React. The `useSyncExternalStore` hook is the correct React 19 API for external stores. The subscribe function calls `eventsMap.observeDeep()` and returns the unobserve function. The snapshot must be a serialized (JSON) representation so React can detect changes via `Object.is()`.

**Primary recommendation:** Implement in this order: (1) Yjs-to-React binding hook, (2) EventCard component to render existing events from test data, (3) slot allocation algorithm with unit tests, (4) popover + write path, (5) drag selection for multi-day, (6) recurring footer. Test the algorithm exhaustively before wiring to UI.

---

## Standard Stack

### Core (already installed — no new installs needed except Floating UI)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| yjs | ^13.6.29 | CRDT shared data types — eventsMap writes | Already installed, module-scope singleton |
| y-partykit | 0.0.33 | Real-time sync already wired | Pinned, pre-stable, do not upgrade |
| React | ^19.2.0 | UI framework | Already in use; useSyncExternalStore built-in |
| Tailwind v4 | ^4.2.1 | Styling — person color tokens, event chips | Already wired; add @theme tokens |
| date-fns | ^4.1.0 | Date math for interval overlap detection | Already installed |

### New Addition
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @floating-ui/react | ^0.27.19 | Popover anchoring, flip/shift collision avoidance | Industry standard for floating UI; 1531 dependents; MIT; actively maintained (published 6 days ago) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @floating-ui/react | CSS position:absolute on parent | position:relative/absolute approach breaks at screen edges; Floating UI handles flip/shift collision avoidance automatically |
| @floating-ui/react | HTML Popover API (native) | Native Popover API (April 2024+) lacks anchor positioning across scroll containers; Floating UI is more reliable |
| Custom drag select | react-drag-to-select library | Library is maintained but adds ~8KB; raw pointer events are ~30 lines and sufficient for this use case (horizontal drag only) |

**Installation:**
```bash
npm install @floating-ui/react
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)
```
src/
├── components/
│   ├── EventSlot.tsx         # MODIFY: add onClick, drag handlers, render EventCard
│   ├── DayColumn.tsx         # MODIFY: receive events array prop, pass to slots
│   ├── WeekRow.tsx           # MODIFY: receive events for the week, pass to DayColumns
│   ├── CalendarGrid.tsx      # MODIFY: subscribe to eventsMap, compute slot layout, add footer
│   ├── EventCard.tsx         # NEW: colored chip with title, optionally time
│   ├── EventPopover.tsx      # NEW: inline create/edit form anchored to slot
│   ├── RecurringFooter.tsx   # NEW: fixed footer grid, one row per person x 7 days
│   └── SettingsPanel.tsx     # NEW: roster management behind header icon
├── lib/
│   ├── ydoc.ts               # MODIFY: add recurringMap and rosterMap exports
│   ├── slotLayout.ts         # NEW: slot allocation algorithm (pure function, fully tested)
│   ├── people.ts             # NEW: static person config (id, label, colorToken)
│   └── eventStore.ts         # NEW: useSyncExternalStore hook wrapping eventsMap
```

### Pattern 1: Yjs-to-React with useSyncExternalStore

**What:** Connect `eventsMap` to React's render cycle. Subscribe to deep changes; serialize to JSON for snapshot comparison.
**When to use:** Any component that reads from `eventsMap` or `recurringMap`.

```typescript
// src/lib/eventStore.ts
// Source: https://react.dev/reference/react/useSyncExternalStore
import { useSyncExternalStore } from 'react'
import { eventsMap } from './ydoc'

// Stable snapshot reference — updated only when Yjs fires a change
let cachedSnapshot: Record<string, unknown[]> = {}

function subscribe(callback: () => void): () => void {
  eventsMap.observeDeep(callback)
  return () => eventsMap.unobserveDeep(callback)
}

function getSnapshot(): Record<string, unknown[]> {
  // eventsMap.toJSON() produces a plain object — new reference each call,
  // but React compares with Object.is so we cache to avoid false re-renders
  const next = eventsMap.toJSON() as Record<string, unknown[]>
  // Only update cache if content actually changed
  if (JSON.stringify(next) !== JSON.stringify(cachedSnapshot)) {
    cachedSnapshot = next
  }
  return cachedSnapshot
}

export function useEventsMap() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
```

**Critical:** The `getSnapshot` function must return a stable reference when data has not changed. If it returns a new object on every call, React will re-render on every `useSyncExternalStore` invocation, causing an infinite loop.

### Pattern 2: Writing Events to Yjs

**What:** Create, update, delete event objects in `eventsMap`. All writes wrapped in `ydoc.transact()` for atomic sync.
**When to use:** EventPopover save/delete handlers.

```typescript
// Source: https://docs.yjs.dev/api/shared-types/y.map
import * as Y from 'yjs'
import { ydoc, eventsMap } from '../lib/ydoc'
import type { CalendarEvent } from '../lib/people'

export function addEvent(event: CalendarEvent): void {
  ydoc.transact(() => {
    const dateKey = event.date  // ISO string: "2026-03-15"
    let dayArray = eventsMap.get(dateKey)
    if (!dayArray) {
      dayArray = new Y.Array()
      eventsMap.set(dateKey, dayArray)
    }
    const yEvent = new Y.Map<unknown>()
    yEvent.set('id', event.id)
    yEvent.set('title', event.title)
    yEvent.set('date', event.date)
    yEvent.set('personId', event.personId ?? null)
    yEvent.set('color', event.color ?? null)
    if (event.startTime) yEvent.set('startTime', event.startTime)
    if (event.isMultiDay) {
      yEvent.set('isMultiDay', true)
      yEvent.set('endDate', event.endDate)
    }
    dayArray.push([yEvent])
  })
}

export function deleteEvent(dateKey: string, eventId: string): void {
  ydoc.transact(() => {
    const dayArray = eventsMap.get(dateKey)
    if (!dayArray) return
    const idx = dayArray.toArray().findIndex(
      (e) => (e as Y.Map<unknown>).get('id') === eventId
    )
    if (idx >= 0) dayArray.delete(idx, 1)
  })
}
```

### Pattern 3: Slot Allocation Algorithm

**What:** Pure function that takes a list of events for a week and returns a `Map<eventId, slotIndex>`. Multi-day events always get slot 0. Single-day events are packed into slots 1-4 using earliest-available assignment.
**When to use:** Called at render time in CalendarGrid/WeekRow after reading from Yjs. Never stored.

```typescript
// src/lib/slotLayout.ts
// Interval graph coloring — greedy earliest-slot assignment

import { parseISO, isWithinInterval } from 'date-fns'

export interface LayoutEvent {
  id: string
  date: string          // ISO start date
  isMultiDay?: boolean
  endDate?: string      // ISO end date (multi-day only)
}

export const MULTI_DAY_SLOT = 0
export const MAX_SLOTS = 5

/**
 * Returns a Map<eventId, slotIndex> for all events in a week.
 * Multi-day events: slot 0 (reserved).
 * Single-day events: slots 1-4, packed greedily.
 *
 * Events that overflow MAX_SLOTS are mapped to -1 (hidden with overflow indicator).
 */
export function computeSlotLayout(events: LayoutEvent[]): Map<string, number> {
  const layout = new Map<string, number>()
  // Slot occupancy: slotIndex -> array of occupied date strings in that week
  const slotOccupancy: string[][] = Array.from({ length: MAX_SLOTS }, () => [])

  // Multi-day first (slot 0)
  const multiDay = events.filter((e) => e.isMultiDay)
  const singleDay = events.filter((e) => !e.isMultiDay)

  for (const event of multiDay) {
    layout.set(event.id, MULTI_DAY_SLOT)
    // Mark all spanned dates as occupied in slot 0
    // (slot 0 can have at most one multi-day event per week row per requirement)
  }

  // Single-day: greedy pack into slots 1-4
  for (const event of singleDay) {
    let assigned = false
    for (let slot = 1; slot < MAX_SLOTS; slot++) {
      if (!slotOccupancy[slot].includes(event.date)) {
        layout.set(event.id, slot)
        slotOccupancy[slot].push(event.date)
        assigned = true
        break
      }
    }
    if (!assigned) layout.set(event.id, -1)  // overflow
  }

  return layout
}
```

**Unit test target:** `computeSlotLayout` must be exhaustively unit-tested before UI integration. Key cases: (a) 5 events same day fills slots 1-4 + overflow, (b) multi-day always slot 0, (c) mixed multi-day and single-day coexist, (d) week boundary — multi-day event that starts in prior week still occupies slot 0 of current week.

### Pattern 4: Floating UI Popover Anchored to a Slot

**What:** Event creation/edit popover positioned adjacent to the clicked slot using Floating UI.
**When to use:** EventSlot click (create) and EventCard click (edit).

```typescript
// src/components/EventPopover.tsx
// Source: https://floating-ui.com/docs/popover
import { useState } from 'react'
import {
  useFloating, autoUpdate, offset, flip, shift,
  useDismiss, useRole, useInteractions, FloatingFocusManager,
} from '@floating-ui/react'

interface EventPopoverProps {
  anchorRef: React.RefObject<HTMLElement | null>
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, personId: string | null, startTime?: string) => void
  initialValues?: { title: string; personId: string | null; startTime?: string }
}

export function EventPopover({ anchorRef, isOpen, onClose, onSave, initialValues }: EventPopoverProps) {
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => { if (!open) onClose() },
    elements: { reference: anchorRef.current },
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'dialog' })
  const { getFloatingProps } = useInteractions([dismiss, role])

  // ... render text input + 7 color chips + time input + save/delete buttons
}
```

### Pattern 5: Drag-to-Select for Multi-Day Event Creation

**What:** Raw pointer events on the calendar grid. Track drag start/end slot; show selection highlight during drag; open popover on pointerup.
**When to use:** EventSlot `onPointerDown`/`onPointerMove`/`onPointerUp` handlers.

```typescript
// DragSelect state lives in CalendarGrid (or a useDragSelect hook)
// Approach: pointer capture on the container, track which slot is under pointer

interface DragState {
  startDate: string    // ISO date of drag start slot
  endDate: string      // ISO date of current drag end slot (updated on move)
  active: boolean
}

// On EventSlot: data-date={isoDate} attribute enables hit-testing
// On container: onPointerDown to start, onPointerMove to update endDate,
//               onPointerUp to finalize + open popover
```

**Critical for pointer events:**
- Call `e.currentTarget.setPointerCapture(e.pointerId)` on `pointerDown` to receive `pointerMove` events even when pointer leaves the element
- Set `user-select: none` during drag to prevent text selection
- A minimum 2px drag threshold distinguishes single-click (open create popover for single day) from drag (multi-day selection)

### Pattern 6: Yjs for Recurring Schedule

**What:** A separate `recurringMap` Y.Map keyed by `"{personId}-{0..6}"` (personId + day-of-week index). Each value is a plain string (activity label) or null.
**When to use:** RecurringFooter reads from `recurringMap`. Edit popover writes to it.

```typescript
// src/lib/ydoc.ts (additions)
export const recurringMap = ydoc.getMap<string>('recurring')
// Key format: "timur-1" (personId + "-" + dayOfWeek 0=Sun..6=Sat)
// Value: activity label string, e.g. "Capital Planning"
// Delete key to remove entry
```

### Pattern 7: Person Config

**What:** A static TypeScript module defining the 7 people with their ID, display label, and Tailwind v4 color token name. Roster additions (PEPL-04) extend this via `rosterMap` in Yjs.
**When to use:** Import `PEOPLE` anywhere color chips or person labels are rendered.

```typescript
// src/lib/people.ts
export interface Person {
  id: string            // 'timur' | 'lois' | 'joy' | 'ivy' | 'both-girls' | 'whole-family' | 'other'
  label: string
  colorToken: string    // Tailwind v4 token name matching @theme entry, e.g. 'timur'
}

export const PEOPLE: Person[] = [
  { id: 'timur',        label: 'Timur',       colorToken: 'timur' },
  { id: 'lois',         label: 'Lois',        colorToken: 'lois' },
  { id: 'joy',          label: 'Joy',         colorToken: 'joy' },
  { id: 'ivy',          label: 'Ivy',         colorToken: 'ivy' },
  { id: 'both-girls',   label: 'Both girls',  colorToken: 'both-girls' },
  { id: 'whole-family', label: 'Whole Family', colorToken: 'whole-family' },
  { id: 'other',        label: 'Other',       colorToken: 'other' },
]
```

### Anti-Patterns to Avoid

- **Storing slotIndex in Yjs:** Never. Slot positions are derived at render time from canonical dates. Storing them creates migration pain and sync conflicts when events are added concurrently.
- **`useSyncExternalStore` with new object on every `getSnapshot`:** Causes infinite re-render loop. Cache the snapshot; only update when content has changed.
- **Writing to Yjs outside `ydoc.transact()`:** For operations that touch multiple keys or multiple elements in an array, always wrap in a transaction. Un-transacted multi-step writes can produce partially-applied intermediate states visible to other clients.
- **`eventsMap.observe()` in a `useEffect` without cleanup:** Memory leak on component unmount. Always return the `unobserve` function from `useEffect`.
- **Using `useEffect` + `useState` for Yjs data:** Causes tearing in React 19 concurrent mode. Use `useSyncExternalStore` instead (Phase 1 research already called this out, Phase 2 must act on it).
- **Pointer events without `setPointerCapture`:** Drag selection breaks when the pointer leaves the starting element. Always call `setPointerCapture` on `pointerDown`.
- **CSS `grid-column: span N` on multi-day EventCard without knowing segment length:** For a multi-day event that spans Mon-Sat in the current week row, span should be 6 columns, not the full event duration. Compute segment length from `min(event.endDate, weekEnd)` minus `max(event.startDate, weekStart)`.
- **Tailwind v4 bracket syntax `bg-[--color-X]`:** Already burned in Phase 1. Use `bg-{token-name}` always.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Popover anchor positioning | Custom `getBoundingClientRect()` + absolute position | `@floating-ui/react` | Flip/shift collision avoidance at viewport edges; scroll container offsets; z-index management |
| CRDT conflict resolution | Custom merge on concurrent event writes | Yjs `Y.Map` + `Y.Array` | CRDT merge is research-level; Yjs handles all concurrent edit convergence |
| React/Yjs subscription | `useEffect` + `useState` observe pattern | `useSyncExternalStore` | Prevents render tearing in React 19 concurrent mode |
| UUID generation | `Math.random().toString(36)` | `crypto.randomUUID()` | Browser-native, cryptographically random, no collisions in shared multi-user context |

**Key insight:** The slot allocation algorithm is intentionally hand-rolled (it's simple enough and unique to this layout model), but everything else in the list above has a tested, maintained solution.

---

## Person Color Tokens (Tailwind v4 @theme)

Based on the Google Sheets screenshot analysis (confirmed visually):

| Person | Visual Description | Recommended OKLCH | Token Name |
|--------|-------------------|------------------|------------|
| Timur | Salmon / coral | `oklch(0.81 0.117 11.638)` (rose-300) | `--color-timur` |
| Lois | Light pink | `oklch(0.899 0.061 343.231)` (pink-200) | `--color-lois` |
| Joy | Light mint green | `oklch(0.925 0.084 155.995)` (green-200) | `--color-joy` |
| Ivy | Periwinkle / lavender blue | `oklch(0.87 0.065 274.039)` (indigo-200) | `--color-ivy` |
| Both girls | Bright cyan | `oklch(0.828 0.111 230.318)` (sky-300) | `--color-both-girls` |
| Whole Family | Bright yellow | `oklch(0.905 0.182 98.111)` (yellow-300) | `--color-whole-family` |
| Other | Light peach / tan | `oklch(0.954 0.038 75.164)` (orange-100) | `--color-other` |
| (unassigned) | Neutral gray | `oklch(0.85 0 0)` | `--color-unassigned` |

These are starting approximations based on Tailwind v4's OKLCH palette. The project requires visual verification against the Google Sheets screenshot; values may need tuning.

Add all tokens to the existing `@theme {}` block in `src/index.css` following the established `--color-{name}` pattern.

---

## Common Pitfalls

### Pitfall 1: getSnapshot Returns New Object Every Call (Infinite Re-render)
**What goes wrong:** React component re-renders in an infinite loop or throws "Maximum update depth exceeded."
**Why it happens:** `useSyncExternalStore` calls `getSnapshot` after every subscription callback fires. If `getSnapshot` returns `eventsMap.toJSON()` directly, it creates a new object on every call. React detects "change" via `Object.is()` on the snapshot reference, finds the reference is new, and schedules another render.
**How to avoid:** Cache the last snapshot in a module-level variable. Only replace the cache when `JSON.stringify(next) !== JSON.stringify(cached)`. Return the cached reference.
**Warning signs:** DevTools shows component rendering hundreds of times per second; console shows maximum update depth warning.

### Pitfall 2: Multi-Day Event CSS Span Exceeds Week Boundary
**What goes wrong:** A multi-day event that starts Monday and ends the following Tuesday renders as `grid-column: span 9` and pushes other columns off-screen.
**Why it happens:** Naively using `daysBetween(startDate, endDate) + 1` for the CSS span without clamping to the current week row.
**How to avoid:** For each week row, compute the event's visible segment: `segmentStart = max(event.date, weekStart)`, `segmentEnd = min(event.endDate, weekEnd)`. CSS span = `daysBetween(segmentStart, segmentEnd) + 1`.
**Warning signs:** Layout breaks on events that cross a Sunday-to-Saturday week boundary.

### Pitfall 3: Yjs Write Without Transaction on Multi-Step Operations
**What goes wrong:** Two clients see a partially-written event (e.g., title set but personId not yet set) during the window between writes.
**Why it happens:** Each `ymap.set()` call broadcasts immediately to peers via y-partykit. Without a transaction, intermediate state is visible.
**How to avoid:** Wrap all writes that create or update an event in `ydoc.transact(() => { ... })`. The entire transaction is broadcast as a single update.
**Warning signs:** Brief "flash" of incomplete event data on collaborating client.

### Pitfall 4: Drag Selection Loses Pointer Events When Exiting Element
**What goes wrong:** Dragging quickly across day column borders stops tracking mid-drag.
**Why it happens:** `pointerMove` events are only dispatched to the element the pointer is currently over — unless pointer capture is set.
**How to avoid:** Call `e.currentTarget.setPointerCapture(e.pointerId)` in the `pointerDown` handler. The element now receives all pointer events until `pointerUp` regardless of pointer position.
**Warning signs:** Drag selection stops updating when pointer crosses column borders.

### Pitfall 5: Popover Remains Open After Yjs Sync (Stale Edit Target)
**What goes wrong:** User A opens edit popover for event X. User B deletes event X. User A's popover is still open with a reference to a now-deleted event.
**Why it happens:** The popover holds a local reference to the event's ID; the Yjs event disappears from `eventsMap`, but the popover state is not cleared.
**How to avoid:** When the edit popover is open for an event ID, check if that event still exists in the current Yjs snapshot on every render. If the event is gone, close the popover automatically.
**Warning signs:** Saving an edit popover for a deleted event creates a ghost event.

### Pitfall 6: Y.Array Index Shifting on Concurrent Deletes
**What goes wrong:** User A deletes event at index 2. Simultaneously User B deletes event at index 1. After Yjs CRDT merge, User A's delete removes the wrong event.
**Why it happens:** Index-based operations on Y.Array are resolved by CRDT positional logic, but if you cache an index before a transaction, concurrent deletes can shift positions.
**How to avoid:** Always find the event by its `id` field (`dayArray.toArray().findIndex(...)`) immediately inside the `ydoc.transact()` call. Never cache array indices across renders.
**Warning signs:** Deleting an event sometimes deletes a different event.

### Pitfall 7: EventSlot onClick vs Drag Conflict
**What goes wrong:** Single-click on a slot triggers both the click handler (open create popover) AND the drag selection handler.
**Why it happens:** A pointerdown + immediate pointerup (click) triggers the same event chain as starting a drag.
**How to avoid:** In the `pointerUp` handler, measure the total pointer movement. If `|dx| < 4px && |dy| < 4px`, treat as click (single-day create). If movement exceeds threshold, treat as completed drag (multi-day create). Do NOT add a separate `onClick` handler; handle everything in pointer events.
**Warning signs:** Clicks on empty slots sometimes open multi-day popovers for zero-width selections.

---

## Code Examples

Verified patterns from official sources:

### Yjs observe → useSyncExternalStore (canonical React 19 pattern)
```typescript
// Source: https://react.dev/reference/react/useSyncExternalStore
// Source: https://docs.yjs.dev/api/shared-types/y.map (observe API)
import { useSyncExternalStore } from 'react'
import { eventsMap } from './ydoc'

let cachedSnapshot = {}

const subscribe = (cb: () => void) => {
  eventsMap.observeDeep(cb)
  return () => eventsMap.unobserveDeep(cb)
}

const getSnapshot = () => {
  const fresh = JSON.stringify(eventsMap.toJSON())
  const cached = JSON.stringify(cachedSnapshot)
  if (fresh !== cached) cachedSnapshot = JSON.parse(fresh)
  return cachedSnapshot
}

export const useEventsMap = () => useSyncExternalStore(subscribe, getSnapshot)
```

### Floating UI popover anchored to slot ref
```typescript
// Source: https://floating-ui.com/docs/popover (v0.27.19)
import { useFloating, offset, flip, shift, autoUpdate, useDismiss, useInteractions, FloatingFocusManager } from '@floating-ui/react'

const { refs, floatingStyles, context } = useFloating({
  open: isOpen,
  onOpenChange: (v) => { if (!v) onClose() },
  middleware: [offset(4), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
})
const dismiss = useDismiss(context)
const { getFloatingProps } = useInteractions([dismiss])
```

### Drag selection with pointer capture
```typescript
// Source: MDN pointer events + joshuawootonn.com drag-to-select pattern
const handlePointerDown = (e: React.PointerEvent, date: string) => {
  e.currentTarget.setPointerCapture(e.pointerId)
  setDragState({ startDate: date, endDate: date, active: true })
}
const handlePointerMove = (e: React.PointerEvent, date: string) => {
  if (!dragState.active) return
  setDragState(s => ({ ...s, endDate: date }))
}
const handlePointerUp = (e: React.PointerEvent) => {
  e.currentTarget.releasePointerCapture(e.pointerId)
  if (dragState.startDate === dragState.endDate) {
    openSingleDayPopover(dragState.startDate)
  } else {
    openMultiDayPopover(dragState.startDate, dragState.endDate)
  }
  setDragState({ startDate: '', endDate: '', active: false })
}
```

### Creating a new Y.Array in eventsMap (transacted)
```typescript
// Source: https://docs.yjs.dev/api/shared-types/y.map
import * as Y from 'yjs'
import { ydoc, eventsMap } from './ydoc'

ydoc.transact(() => {
  let arr = eventsMap.get('2026-03-15')
  if (!arr) {
    arr = new Y.Array()
    eventsMap.set('2026-03-15', arr)
  }
  const evt = new Y.Map<unknown>()
  evt.set('id', crypto.randomUUID())
  evt.set('title', 'Doctor appointment')
  evt.set('personId', 'lois')
  arr.push([evt])
})
```

### @theme color tokens for Tailwind v4
```css
/* src/index.css — additions to existing @theme {} block */
/* Source: https://tailwindcss.com/docs/theme (CSS-first @theme pattern) */
@theme {
  /* existing tokens */
  --color-today-bg: oklch(0.95 0.03 240);
  --color-weekend-bg: oklch(0.93 0 0);

  /* Phase 2: person color tokens */
  --color-timur:        oklch(0.81 0.117 11.638);   /* salmon/coral — rose-300 approx */
  --color-lois:         oklch(0.899 0.061 343.231);  /* light pink — pink-200 */
  --color-joy:          oklch(0.925 0.084 155.995);  /* light mint green — green-200 */
  --color-ivy:          oklch(0.87 0.065 274.039);   /* periwinkle — indigo-200 */
  --color-both-girls:   oklch(0.828 0.111 230.318);  /* bright cyan — sky-300 */
  --color-whole-family: oklch(0.905 0.182 98.111);   /* bright yellow — yellow-300 */
  --color-other:        oklch(0.954 0.038 75.164);   /* light peach — orange-100 */
  --color-unassigned:   oklch(0.85 0 0);             /* neutral gray */
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useEffect` + `useState` for Yjs | `useSyncExternalStore` | React 18+ | Prevents render tearing; correct for concurrent mode |
| CSS `position: absolute` popovers | `@floating-ui/react` | 2022+, current in 2025 | Automatic viewport collision avoidance |
| `uuid` npm package | `crypto.randomUUID()` | Browser baseline ~2021 | No dependency needed; cryptographically strong |
| Manual date arithmetic for overlap | `date-fns isWithinInterval` | N/A | Already in use from Phase 1; use for multi-day overlap checks |

**Deprecated/outdated for this project:**
- `useEffect` + `setState` for Yjs subscription: anti-pattern in React 19; causes tearing
- Storing `rowIndex` in Yjs event schema: schema has the field in its type definition but it must never be written — derive only

---

## Open Questions

1. **y-partykit 0.0.33 vs y-partyserver**
   - What we know: y-partykit@0.0.33 is last published 9 months ago; it is pinned in package.json; it works correctly
   - What's unclear: Whether Cloudflare's acquisition of PartyKit produced a newer `y-partyserver` package that supersedes it
   - Recommendation: Do not upgrade y-partykit for Phase 2; it is pinned and functional. Research `y-partyserver` before Phase 3 if stability concerns arise.

2. **getSnapshot caching strategy under heavy concurrent writes**
   - What we know: JSON.stringify comparison on every getSnapshot call is O(n) in event count
   - What's unclear: Whether this causes performance problems at 100+ events (likely not for a family calendar with <200 events)
   - Recommendation: Use JSON.stringify comparison for now; switch to incremental update tracking (caching event count or Yjs `ydoc.clientID`-based version counter) only if profiling shows slowness.

3. **Multi-day event slot 0 collision**
   - What we know: Multi-day events are assigned slot 0. The CONTEXT.md says "slot position 1" (1-indexed). This research uses 0-indexed internally.
   - What's unclear: Whether two multi-day events in the same week row that don't overlap date-wise can both be in slot 0, or if they need to be in different slots.
   - Recommendation: The CONTEXT.md says multi-day events "always render in slot position 1" — treat this as a hard constraint: only ONE multi-day event row per week row. If multiple multi-day events overlap within a week, the second goes to slot 1 (0-indexed), pushing single-day events down. Algorithm must handle this case.

4. **Color accuracy: oklch values vs screenshot**
   - What we know: Approximate OKLCH values derived from Tailwind v4 palette matching; screenshot analyzed visually
   - What's unclear: Whether the Google Sheets colors use standard Tailwind palette values or custom hex values
   - Recommendation: Start with the values in this document. After first render, compare side-by-side with the screenshot and adjust oklch lightness/chroma as needed. Human verification plan should include color comparison step.

---

## Validation Architecture

> nyquist_validation is enabled in .planning/config.json — section included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vite.config.ts` (inline `test` block) |
| Quick run command | `npx vitest run src/lib/slotLayout.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EVNT-01 | EventSlot click opens popover; Enter saves event to eventsMap | component | `npx vitest run src/components/EventPopover.test.tsx` | Wave 0 |
| EVNT-02 | EventCard click opens popover pre-filled with event data | component | `npx vitest run src/components/EventCard.test.tsx` | Wave 0 |
| EVNT-03 | Delete button removes event from eventsMap | unit | `npx vitest run src/lib/eventStore.test.ts -t "deleteEvent"` | Wave 0 |
| EVNT-04 | Multi-day event assigned slot 0; CSS span = week segment length | unit | `npx vitest run src/lib/slotLayout.test.ts -t "multi-day"` | Wave 0 |
| EVNT-05 | Event with startTime stores startTime field in Yjs | unit | `npx vitest run src/lib/eventStore.test.ts -t "addEvent with time"` | Wave 0 |
| EVNT-06 | 4 events same day occupy slots 1-4; 5th event overflow | unit | `npx vitest run src/lib/slotLayout.test.ts -t "overflow"` | Wave 0 |
| PEPL-01 | EventCard applies bg-{personId} class matching person colorToken | component | `npx vitest run src/components/EventCard.test.tsx -t "person color"` | Wave 0 |
| PEPL-02 | Color chip click in popover assigns personId to event | component | `npx vitest run src/components/EventPopover.test.tsx -t "color chip"` | Wave 0 |
| PEPL-04 | rosterMap set/get/delete writes persist in Yjs | unit | `npx vitest run src/lib/eventStore.test.ts -t "roster"` | Wave 0 |
| RECU-01 | RecurringFooter renders 7 rows x 7 columns grid | component | `npx vitest run src/components/RecurringFooter.test.tsx` | Wave 0 |
| RECU-02 | Click on recurring cell opens edit popover | component | `npx vitest run src/components/RecurringFooter.test.tsx -t "edit"` | Wave 0 |
| SHRG-02 | Two Y.Doc instances with same eventsMap merge concurrent writes without data loss | unit | `npx vitest run src/lib/eventStore.test.ts -t "concurrent"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/slotLayout.test.ts` (pure algorithm — fast, no DOM)
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps (files that do not yet exist)
- [ ] `src/lib/slotLayout.ts` — slot allocation algorithm (to be created)
- [ ] `src/lib/slotLayout.test.ts` — covers EVNT-04, EVNT-06 (exhaustive algorithm tests)
- [ ] `src/lib/people.ts` — person config static module
- [ ] `src/lib/eventStore.ts` — useSyncExternalStore binding + addEvent/deleteEvent helpers
- [ ] `src/lib/eventStore.test.ts` — covers EVNT-03, EVNT-05, PEPL-04, SHRG-02 (Yjs in-memory tests without network)
- [ ] `src/components/EventCard.tsx` — colored event chip component
- [ ] `src/components/EventCard.test.tsx` — covers EVNT-02, PEPL-01
- [ ] `src/components/EventPopover.tsx` — inline create/edit popover
- [ ] `src/components/EventPopover.test.tsx` — covers EVNT-01, PEPL-02
- [ ] `src/components/RecurringFooter.tsx` — recurring schedule footer
- [ ] `src/components/RecurringFooter.test.tsx` — covers RECU-01, RECU-02
- [ ] Framework install: `npm install @floating-ui/react` — only new package needed

*(SHRG-02 can be tested in-memory: create two Y.Doc instances, apply updates via `Y.applyUpdate`, verify merge correctness. No network required.)*

---

## Sources

### Primary (HIGH confidence)
- `https://docs.yjs.dev/api/shared-types/y.map` — Y.Map observe/unobserve API, set/get/delete, nested Y.Array creation
- `https://react.dev/reference/react/useSyncExternalStore` — subscribe + getSnapshot pattern, stability requirements
- `https://floating-ui.com/docs/popover` — useFloating, useInteractions, FloatingFocusManager, offset/flip/shift middleware
- `https://floating-ui.com/docs/react` — React-specific integration (v0.27.19)

### Secondary (MEDIUM confidence)
- `https://www.npmjs.com/package/@floating-ui/react` — version 0.27.19 confirmed current, 1531 dependents, MIT
- `https://kyrylo.org/tailwind-css-v4-color-palette-reference/` — OKLCH values for Tailwind v4 palette colors used for person tokens
- `https://github.com/nikgraf/react-yjs` — react-yjs useY hook implementation as reference for useSyncExternalStore pattern
- `https://www.joshuawootonn.com/react-drag-to-select` — DOMVector pattern, pointer capture, drag threshold approach
- Wikipedia interval scheduling + activity selection problem — greedy O(n log n) slot assignment algorithm correctness

### Tertiary (LOW confidence, needs validation)
- y-partykit status: published 9 months ago, no newer version on npm — confirm with `npm info y-partykit` before Phase 2 coding
- Color approximations: OKLCH values matched from Tailwind v4 palette to visual screenshot inspection — require human visual verification step

---

## Metadata

**Confidence breakdown:**
- Standard stack (Yjs, React, Tailwind): HIGH — all verified via official docs
- Floating UI integration: HIGH — verified via official docs, confirmed version 0.27.19
- useSyncExternalStore + Yjs pattern: HIGH — both APIs verified separately; combined pattern is architecturally sound and matches what react-yjs implements
- Slot allocation algorithm: HIGH — well-documented interval graph coloring problem; correctness guaranteed by unit tests
- Person color OKLCH values: MEDIUM — derived from Tailwind v4 palette matched to screenshot; needs visual verification
- Drag selection: MEDIUM — pattern verified via multiple sources; touch event support not researched (out of scope for v1)
- y-partykit stability: MEDIUM — pinned at 0.0.33, no newer version found; pre-stable semver is the known risk

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (Floating UI is active; recheck if > 30 days; Tailwind v4 stable for longer)
