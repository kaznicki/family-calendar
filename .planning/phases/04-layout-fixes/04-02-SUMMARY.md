---
phase: 04-layout-fixes
plan: "02"
subsystem: ui
tags: [react, tailwind, calendar, slot-layout, multi-day-events]

# Dependency graph
requires:
  - phase: 04-layout-fixes/04-01
    provides: "computeSlotLayout with real slots 1–4 for all events including multi-day (MULTI_DAY_SLOT slot-0 removed)"
provides:
  - "WeekRow no longer renders a dedicated h-7 multi-day spanning row — deleted entirely"
  - "DayColumn renders all events (single-day and multi-day) uniformly in slot rows 1–4 via slotMap"
  - "EventCard shows optional left-border visual marker when isMultiDay=true"
  - "Multi-day events filtered by date range inside DayColumn so only relevant events appear per column"
affects:
  - "04-layout-fixes/04-03"
  - "Phase 5 (RDBL-01) — DayColumn slot structure is now stable"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pass full weekEvents array to every DayColumn — let slotMap (keyed by eventId) determine visibility, not date-keyed allEvents"
    - "Filter multi-day events by date range in DayColumn to prevent false positives from other weeks"
    - "isMultiDay visual marker via border-l-2 on EventCard button — subtle, non-breaking indicator"

key-files:
  created: []
  modified:
    - src/components/WeekRow.tsx
    - src/components/DayColumn.tsx
    - src/components/EventCard.tsx
    - src/components/WeekRow.test.tsx
    - src/components/DayColumn.test.tsx
    - src/components/EventCard.test.tsx

key-decisions:
  - "Pass weekEvents (full week array) to every DayColumn instead of allEvents[isoDate] — required because multi-day events are keyed by start date only, not by every touched date"
  - "Filter multi-day events in DayColumn by checking event.date <= columnDate <= event.endDate — prevents events from adjacent weeks appearing in wrong columns"
  - "isMultiDay left border uses border-l-2 border-l-black/20 — subtle indicator that does not change chip width or slot height"

patterns-established:
  - "Slot chip rendering: single source of truth is slotMap (eventId -> slot 1–4); DayColumn loops slots 1–4 and does events.find(e => slotMap.get(e.id) === slotIndex)"
  - "Multi-day event visibility: event is in scope for a DayColumn if event.date <= colDate <= event.endDate (ISO string comparison)"

requirements-completed:
  - LAYT-01

# Metrics
duration: ~90min (including human verify checkpoint)
completed: 2026-03-13
---

# Phase 4 Plan 02: Multi-Day Events in Slot Rows Summary

**Removed dedicated multi-day spanning row from WeekRow; multi-day event chips now render inside DayColumn slot rows 1–4 using the same slot layout as single-day events, with an optional left-border marker on EventCard.**

## Performance

- **Duration:** ~90 min (including human-verify checkpoint pause)
- **Started:** 2026-03-13
- **Completed:** 2026-03-13
- **Tasks:** 2 auto tasks + 1 human-verify checkpoint (approved)
- **Files modified:** 6

## Accomplishments

- Deleted the `h-7 grid-cols-7` multi-day spanning row div from WeekRow.tsx along with all associated span-calculation logic
- DayColumn now receives the full `weekEvents` array so slotMap lookups find multi-day events regardless of which day column is being rendered
- EventCard renders a `border-l-2 border-l-black/20` left border when `isMultiDay=true`, providing a subtle visual distinction without altering slot height or width
- Auto-fixed a date-range filtering bug: DayColumn now filters multi-day events by checking whether the column date falls within `event.date` to `event.endDate`, preventing events from adjacent weeks from appearing erroneously
- All 159 tests pass; TypeScript clean; build passes; human verified multi-day chips align at consistent slot heights across spanned days

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests for DayColumn multi-day + EventCard marker** - `583dd8c` (test)
2. **Task 1 GREEN: DayColumn + EventCard implementation** - `c5f6f19` (feat)
3. **Task 2 RED: Failing test for WeekRow multi-day row removal** - `07e50eb` (test)
4. **Task 2 GREEN: Remove multi-day spanning row; pass weekEvents to DayColumn** - `397532f` (feat)
5. **Auto-fix: Filter multi-day events by date range in DayColumn** - `0b9e6e1` (fix)

_Note: TDD tasks have separate RED (test) and GREEN (feat) commits. Auto-fix applied during Task 2 verification._

## Files Created/Modified

- `src/components/WeekRow.tsx` — Deleted multi-day spanning row div; now passes full `weekEvents` array to every DayColumn
- `src/components/DayColumn.tsx` — Filters events by date range for multi-day; passes `isMultiDay` flag through to EventCard via EventSlot
- `src/components/EventCard.tsx` — Activates `border-l-2 border-l-black/20` left-border marker when `isMultiDay=true`
- `src/components/WeekRow.test.tsx` — Replaced multi-day spanning-row test with test verifying chips appear inside DayColumn
- `src/components/DayColumn.test.tsx` — Added tests for multi-day event at slot 1, single-day coexistence at slot 2, 4-slot rendering
- `src/components/EventCard.test.tsx` — Added tests for isMultiDay left-border presence/absence

## Decisions Made

- **Pass full weekEvents to DayColumn:** The existing `allEvents[isoDate]` keying placed multi-day events only under their start date. Since slotMap is keyed by eventId (not date), passing `weekEvents` to all DayColumns is the correct approach — each column finds its events via slotMap, not date indexing.
- **Date-range filter in DayColumn:** Without explicit filtering, DayColumn would render a Monday–Wednesday event inside the Thursday and Friday columns (slotMap still assigns it a slot number for overlap purposes). The fix: only show an event in a column if `colDate` falls within `[event.date, event.endDate]`.
- **Left-border marker instead of badge/icon:** `border-l-2 border-l-black/20` is subtle and preserves slot height consistency. The chip still fills full width, keeping single-day and multi-day events visually uniform in size.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Multi-day events rendering in wrong day columns**
- **Found during:** Task 2 (WeekRow multi-day row removal)
- **Issue:** After passing `weekEvents` to all DayColumns, a Monday–Wednesday event appeared in Thursday and Friday columns because slotMap assigns it a slot, and DayColumn's `events.find()` matched it regardless of date
- **Fix:** Added date-range guard in DayColumn: `if (event.isMultiDay && event.endDate) { const start = event.date; const end = event.endDate; if (colISO < start || colISO > end) return false; }`
- **Files modified:** `src/components/DayColumn.tsx`
- **Verification:** All 159 tests pass; human verified correct column containment visually
- **Committed in:** `0b9e6e1` (separate fix commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug)
**Impact on plan:** Fix was necessary for correctness. Without it multi-day events would appear in every column of the week. No scope creep.

## Issues Encountered

None beyond the date-range filtering bug documented above. Human-verify checkpoint was approved on first review.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- LAYT-01 complete: multi-day event chips render in real slot rows inside DayColumn with correct visual alignment across spanned days
- WeekRow no longer contains any multi-day spanning-row logic — clean surface for Phase 5 RDBL-01 rendering changes
- DayColumn slot structure is stable (slots 1–4, uniform height, slotMap as single source of truth)
- Phase 04-03 (header alignment fix) can proceed independently — no DayColumn dependency

---
*Phase: 04-layout-fixes*
*Completed: 2026-03-13*
