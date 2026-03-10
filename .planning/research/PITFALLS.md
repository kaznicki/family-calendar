# Domain Pitfalls: Family Calendar Web App

**Domain:** Shared family calendar web app (grid layout, link-based access, real-time CRDT sync)
**Researched:** 2026-03-10
**Confidence:** HIGH (CSS grid, print CSS, CRDT patterns), MEDIUM (Yjs-specific edge cases, PartyKit specifics)

---

## Critical Pitfalls

### Pitfall 1: Initializing Y.Doc Inside a React Component

**What goes wrong:** Calling `new Y.Doc()` inside a React function component body creates a new document on every render. React 19 Strict Mode mounts components twice in development — creating two conflicting Yjs documents. Any parent re-render recreates the doc, wiping accumulated local state before it syncs.

**Consequences:** Intermittent data loss during development, confusing sync behavior that disappears in production, IndexedDB persistence never accumulates correctly.

**Prevention:**
- Initialize `Y.Doc` exactly once: at module scope or inside `useRef(() => new Y.Doc())`
- Use `y-partykit`'s `useYProvider` hook, which manages document lifecycle correctly
- Code review rule: never `new Y.Doc()` inside a component body

**Detection:** Calendar clears on every fast-refresh during development. Add a `doc.on('update', ...)` listener — you will see a new doc ID each render.

**Phase:** Phase 1 (Yjs integration scaffold)

---

### Pitfall 2: Storing Derived Display Fields in the Yjs Shared Map

**What goes wrong:** Storing computed display fields like `weekIndex`, `columnStart`, `columnEnd`, `rowSlot` alongside canonical data. When the grid layout changes, stored display coordinates are stale. Concurrent edits to derived fields create CRDT conflicts resolved arbitrarily.

**Prevention:**
- Yjs stores only canonical data: `id`, `title`, `startDate` (ISO string), `endDate` (ISO string), `personId`, `eventType`
- All display coordinates derived at render time from canonical dates and current grid configuration
- Think of Yjs as the database row and the React component as the query layer

**Detection:** If you see a field like `gridRow` or `columnSpan` being written to a `Y.Map`, that is the antipattern.

**Phase:** Phase 1 (define canonical event schema before writing grid rendering code)

---

### Pitfall 3: Open WebSocket Room With No Access Token

**What goes wrong:** No access controls on the PartyKit server — any WebSocket connection is accepted. Anyone who discovers the URL can delete all events or inject garbage data.

**Prevention:**
- Embed a hard-to-guess secret token in the shareable URL (e.g., `/calendar/aBcD3fGhIj`)
- PartyKit server validates the room name format in `onConnect`
- Add rate limiting in the PartyKit `onMessage` handler
- Add `robots.txt` disallowing all crawlers

**Detection:** Check the PartyKit server `onConnect` handler — if it accepts all connections unconditionally, this pitfall is present.

**Phase:** Phase 1 (PartyKit server scaffold) — retrofitting token validation after the data model is live is painful

---

### Pitfall 4: Multi-Day Event Rendering Without a Slot Reservation System

**What goes wrong:** A naive grid places each event in the first available row slot without checking whether that slot is occupied by an overlapping multi-day event. Two overlapping multi-day events both land in slot 1 and render on top of each other.

**Why it happens:** Single-day events work with `Array.filter(events for that day)`. Multi-day events require inspecting all days in their span and reserving the same row slot number across all those days simultaneously.

**Consequences:** Events overlap and are unreadable as soon as the calendar has more than one multi-day event in the same week.

**Prevention:**
- Implement a slot allocation algorithm that runs per-week, not per-day
- Collect all events overlapping any day in the week, sort by start date then duration (longest first)
- Assign slot numbers using interval scheduling: lowest slot with no overlap
- This is a pure function: `(events: Event[], weekStart: Date) => Map<eventId, slotNumber>`
- Write unit tests for this function — it is the hardest piece of logic in the app

**Detection:** Render two overlapping multi-day events in the same week. If they visually overlap, the slot system is missing.

**Phase:** Phase 2 (grid rendering) — allocate dedicated time for this algorithm

---

### Pitfall 5: CSS Grid Print Layout Collapsing or Overflowing

**What goes wrong:** The `display: grid` layout that works on screen breaks when printed. Common failures: (1) 7-column grid collapses to single column because `fr` units aren't resolved correctly in print media, (2) grid overflows page margins and clips the rightmost column, (3) week rows break across pages mid-row.

**Consequences:** The printed fridge copy — a core non-negotiable requirement — is unusable.

**Prevention:**
- Use `@media print` with `grid-template-columns: repeat(7, 14%)` (percentages, not `fr`)
- Apply `break-inside: avoid` and `page-break-inside: avoid` to week row containers
- Set `@page { size: A4 landscape; margin: 10mm; }` explicitly
- Test in Chrome, Safari, AND Firefox — do not test only in Chrome

**Detection:** Open browser print dialog (Ctrl+P). If the rightmost column is clipped or the grid collapses, print CSS needs work.

**Phase:** Phase 3 (print view) — keep print layout in mind when writing grid CSS from the start

---

## Moderate Pitfalls

### Pitfall 6: Storing Events as JSON Strings (Coarse CRDT Granularity)

**What goes wrong:** `events.set(id, JSON.stringify(eventObject))` means concurrent edits to different fields of the same event produce last-write-wins at the string level, silently discarding one user's changes.

**Prevention:** Store each event as a `Y.Map` (not a JSON string) so individual fields are CRDT-aware.

**Phase:** Phase 1 (Yjs data schema) — easier to do correctly upfront

---

### Pitfall 7: Recurring Events Stored as Expanded Instances Instead of Rules

**What goes wrong:** Ivy's dance schedule stored as hundreds of individual events. When the time changes, you must update all instances or write a migration.

**Prevention:**
- Store as a rule: `{ type: 'recurring', title: "Ivy's Dance", dayOfWeek: 3, time: '16:00', personId: 'ivy', effectiveFrom: '2026-01-01' }`
- Expand to display instances at render time for the visible date range only
- Store exceptions (cancelled/moved occurrence) as a separate override map keyed by `ruleId + ISO date`

**Phase:** Phase 2 (recurring schedule) — data model decision must precede rendering

---

### Pitfall 8: Mobile Touch Target Sizes on the Grid

**What goes wrong:** A 7-column grid on a 375px screen produces ~53px wide columns. Interactive elements inside those columns are often below the 44×44px WCAG 2.1 minimum touch target.

**Prevention:**
- Set `min-h-[44px]` on all interactive grid elements
- Use `touch-action: manipulation` to eliminate the 300ms tap delay on iOS
- Test on a real phone or Chrome DevTools at 375px during Phase 1, not after
- Consider "tap day to add event" rather than per-slot add buttons

**Phase:** Phase 1 (grid layout) — mobile interaction patterns must be baked in, not retrofitted

---

### Pitfall 9: No Offline/Reconnect Status Indicator

**What goes wrong:** When the WebSocket connection drops, the app continues working locally but silently queues changes. The user has no indication whether edits have synced.

**Prevention:**
- Add a connection status indicator: "Synced", "Connecting...", or "Offline — changes saved locally"
- Use the provider's `synced` event and connection `status` event to drive the indicator

**Phase:** Phase 2 (sync layer) — add when Yjs provider is first wired up

---

### Pitfall 10: Color Coding Breaking Under Grayscale Print

**What goes wrong:** Background colors are the only person differentiator. Grayscale printing (common for home printers) makes all events look identical.

**Prevention:**
- In `@media print`, render a person initial inside the event cell (e.g., "M", "D", "I", "A")
- Or use a left border pattern per person (solid, dashed, dotted, double) as a print-safe fallback
- Test print preview with "Black and white" selected in Chrome

**Phase:** Phase 3 (print view) — define person color tokens in Phase 1 so print overrides have a clean hook

---

### Pitfall 11: Date Arithmetic Bugs Around Week Boundaries and DST

**What goes wrong:** Mixing local-time `new Date()` with `startOfWeek()` can produce off-by-one errors during DST transitions — an event starting Sunday at 11pm local time placed in Monday's column.

**Prevention:**
- Establish a single canonical timezone for all date storage (ISO 8601 strings)
- Use `differenceInCalendarDays` for span calculation, never raw timestamp arithmetic
- Write unit tests for DST boundary dates (second Sunday in March, first Sunday in November for US Eastern)

**Phase:** Phase 1 (date utility layer) — write date helpers with tests before grid rendering

---

## Minor Pitfalls

### Pitfall 12: Holiday Data Hardcoded Without Update Path

**Prevention:** Store in the Yjs shared document as a separate shared type, or in an easily editable JSON file. Do not bury in component code.

**Phase:** Phase 2

---

### Pitfall 13: Yjs Document Growing Unbounded

**Prevention:** Keep `gc: true` (the default). Do not disable GC for debugging without re-enabling before deployment.

**Phase:** Note in data model docs from Phase 1.

---

### Pitfall 14: `window.print()` Called Before Print-Mode DOM Update Completes

**Prevention:** Use `flushSync` or `useEffect` to ensure DOM update completes before `window.print()`. Reset `isPrintMode = false` in the `afterprint` event listener.

**Phase:** Phase 3 (print feature implementation)

---

### Pitfall 15: Event Editor Not Handling Missing End Date

**Prevention:** Default `endDate` to `startDate` when not provided. Store single-day events as `startDate === endDate`, not `endDate: null`.

**Phase:** Phase 2 (event creation)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Yjs scaffold | Y.Doc initialized in component body | Initialize at module scope or in useRef |
| Phase 1: Yjs schema | JSON string storage losing field-level CRDT | Use nested Y.Map per event |
| Phase 1: Security | Open WebSocket room with no token | Embed secret token in URL; validate in onConnect |
| Phase 1: Date utilities | DST off-by-one in column placement | Use differenceInCalendarDays; write DST unit tests |
| Phase 2: Grid rendering | Multi-day event slot collision | Implement interval-scheduling slot allocator with tests |
| Phase 2: Mobile UX | Touch targets too small at mobile width | 44px minimum; test on 375px viewport |
| Phase 2: Recurring events | Storing instances instead of rules | Store rule + exceptions model; expand at render time |
| Phase 2: Sync feedback | No offline/reconnect status indicator | Wire connection status on provider setup |
| Phase 3: Print layout | CSS Grid collapsing or overflowing on print | Use percentage-based columns; test in 3 browsers |
| Phase 3: Print color | Grayscale printing loses person color coding | Add person initials or border patterns in @media print |

---

## Highest-Risk Areas Summary

1. **Multi-day event slot allocation (Pitfall 4)** — The core algorithmic challenge of the custom grid model. Plan dedicated time; write unit tests.
2. **Print CSS for CSS Grid (Pitfall 5)** — Print is non-negotiable. Browser print engines diverge on CSS Grid. Requires cross-browser testing.
3. **Y.Doc lifecycle in React (Pitfall 1)** — A known Yjs + React footgun. Gets wrong in development, hard to detect. Address on day one.

---
*Researched: 2026-03-10*
