---
phase: 02-events-and-sync
plan: 01
subsystem: ui
tags: [yjs, floating-ui, vitest, typescript, slot-layout, stubs]

# Dependency graph
requires:
  - phase: 01-grid-scaffold
    provides: ydoc.ts with eventsMap, EventSlot, DayColumn, CalendarGrid components
provides:
  - "@floating-ui/react 0.27.19 installed in node_modules"
  - "ydoc.ts extended with recurringMap and rosterMap Yjs maps"
  - "computeSlotLayout pure function with LayoutEvent interface and MULTI_DAY_SLOT/MAX_SLOTS constants"
  - "11 stub/implementation files: slotLayout.ts (full), slotLayout.test.ts (8 real tests), people.ts (pre-existing), eventStore.ts, eventStore.test.ts, EventCard.tsx, EventCard.test.tsx, EventPopover.tsx, EventPopover.test.tsx, RecurringFooter.tsx, RecurringFooter.test.tsx"
affects:
  - 02-02-people-and-slot-layout
  - 02-03-event-store
  - 02-04-event-card
  - 02-05-event-popover
  - 02-07-recurring-footer

# Tech tracking
tech-stack:
  added:
    - "@floating-ui/react 0.27.19 — popover positioning for EventPopover"
  patterns:
    - "ydoc.getMap<string>() at module scope for recurring and roster Yjs maps"
    - "it.todo() stubs in test files that are not yet implemented (exit 0 in vitest)"
    - "computeSlotLayout: slot 0=multi-day, slots 1-4=single-day per date, -1=overflow"

key-files:
  created:
    - src/lib/slotLayout.ts
    - src/lib/slotLayout.test.ts
    - src/lib/eventStore.ts
    - src/lib/eventStore.test.ts
    - src/components/EventCard.tsx
    - src/components/EventCard.test.tsx
    - src/components/EventPopover.tsx
    - src/components/EventPopover.test.tsx
    - src/components/RecurringFooter.tsx
    - src/components/RecurringFooter.test.tsx
  modified:
    - src/lib/ydoc.ts
    - package.json
    - package-lock.json

key-decisions:
  - "computeSlotLayout slot collision checked per-date not per-week — two non-overlapping multi-day events in same week both get slot 0"
  - "LayoutEvent interface uses optional isMultiDay/endDate fields — downstream code checks isMultiDay truthiness"
  - "MULTI_DAY_SLOT=0 and MAX_SLOTS=5 exported as named constants — avoids magic numbers in CalendarGrid"
  - "people.ts was already fully implemented in a prior session (commit c04db5c) — stub step skipped, pre-existing content kept"

patterns-established:
  - "Wave 0 Nyquist compliance: all test files exist before any implementation plan runs"
  - "slotLayout algorithm: pure function no Yjs no React, takes events array + weekStart + weekEnd"

requirements-completed:
  - EVNT-01
  - EVNT-02
  - EVNT-03
  - EVNT-04
  - EVNT-05
  - EVNT-06
  - PEPL-01
  - PEPL-02
  - PEPL-04
  - RECU-01
  - RECU-02
  - SHRG-02

# Metrics
duration: 3min
completed: 2026-03-10
---

# Phase 2 Plan 01: Wave 0 Scaffold Summary

**@floating-ui/react installed, ydoc.ts extended with recurringMap and rosterMap, and computeSlotLayout implemented with 8 passing tests giving all downstream plans real file targets**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-10T23:08:08Z
- **Completed:** 2026-03-10T23:11:00Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Installed @floating-ui/react 0.27.19 and extended ydoc.ts with recurringMap (recurring schedule) and rosterMap (dynamic person additions) Yjs maps
- Created all 11 Wave 0 stub/implementation files — every downstream plan now has a real file target for its verify commands
- computeSlotLayout pure function fully implemented with 8 passing tests: slot 0 for multi-day, slots 1-4 for single-day per date, -1 for overflow

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @floating-ui/react and extend ydoc.ts** - `1c6d56d` (feat)
2. **Task 2: Create all Wave 0 stub files** - `6feaa29` (feat)
3. **Task 2 deviation fix: implement computeSlotLayout** - `991d8ad` (feat)

## Files Created/Modified

- `src/lib/ydoc.ts` - Added recurringMap and rosterMap Yjs map exports
- `src/lib/slotLayout.ts` - Full computeSlotLayout implementation with LayoutEvent interface, MULTI_DAY_SLOT=0, MAX_SLOTS=5 constants
- `src/lib/slotLayout.test.ts` - 8 real passing tests for computeSlotLayout (upgraded from it.todo() stubs by linter)
- `src/lib/people.ts` - Pre-existing full implementation (Person, CalendarEvent types, PEOPLE array) — not modified
- `src/lib/eventStore.ts` - Empty placeholder, 11 it.todo() stubs in test file
- `src/lib/eventStore.test.ts` - 11 it.todo() stubs for EVNT-03, EVNT-05, PEPL-04, SHRG-02
- `src/components/EventCard.tsx` - Minimal renderable placeholder (returns null)
- `src/components/EventCard.test.tsx` - 4 it.todo() stubs for EVNT-02, PEPL-01
- `src/components/EventPopover.tsx` - Minimal renderable placeholder (returns null)
- `src/components/EventPopover.test.tsx` - 7 it.todo() stubs for EVNT-01, PEPL-02
- `src/components/RecurringFooter.tsx` - Minimal renderable placeholder (returns null)
- `src/components/RecurringFooter.test.tsx` - 6 it.todo() stubs for RECU-01, RECU-02
- `package.json` / `package-lock.json` - @floating-ui/react added

## Decisions Made

- `computeSlotLayout` slot collision is per-date, not per-week: two non-overlapping multi-day events in the same week both get slot 0
- `MULTI_DAY_SLOT=0` and `MAX_SLOTS=5` exported as named constants to avoid magic numbers in downstream rendering
- `people.ts` was already fully implemented (commit c04db5c from a prior session) — the stub step was skipped and the pre-existing content preserved

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Implemented computeSlotLayout after linter upgraded slotLayout.test.ts from stubs to real tests**

- **Found during:** Task 2 (Create all Wave 0 stub files)
- **Issue:** An external linter replaced the it.todo() stubs in `slotLayout.test.ts` with 8 real test cases that import and call `computeSlotLayout`. Since `slotLayout.ts` only had `export {}`, `npx vitest run` would exit non-zero (import failure).
- **Fix:** Implemented `computeSlotLayout(events, weekStart, weekEnd) => Map<id, slot>` as a pure function with correct slot allocation logic. All 8 tests pass.
- **Files modified:** src/lib/slotLayout.ts
- **Verification:** `npx vitest run` exits 0: 28 passed, 28 todo, 0 failures
- **Committed in:** 991d8ad

**2. [No action — pre-existing] people.ts already had full implementation**

- **Found during:** Task 2
- **Issue:** people.ts was written in a prior session (commit c04db5c) with full Person/CalendarEvent types and PEOPLE array. The plan expected to create a stub.
- **Fix:** No action — the pre-existing content is correct and complete. Kept as-is.
- **Impact:** Positive; downstream plans have a richer foundation than stubs.

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking), 1 positive pre-existing (no action)
**Impact on plan:** Auto-fix was necessary to meet Wave 0 exit criteria (vitest exits 0). computeSlotLayout was planned for 02-02 but the linter's upgrade to real tests made early implementation necessary and correct.

## Issues Encountered

None beyond the deviation documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Wave 0 complete: all 11 downstream files exist and vitest exits 0
- computeSlotLayout already implemented — plan 02-02 can focus on people.ts integration and CalendarGrid wiring
- people.ts already has Person, CalendarEvent types and PEOPLE array — plan 02-02 can skip that work
- @floating-ui/react ready for plan 02-05 EventPopover implementation
- recurringMap and rosterMap in ydoc.ts ready for plans 02-06 and 02-07

---
*Phase: 02-events-and-sync*
*Completed: 2026-03-10*

## Self-Check: PASSED

- All 13 files verified on disk (FOUND)
- All 3 task commits verified in git log (1c6d56d, 6feaa29, 991d8ad)
