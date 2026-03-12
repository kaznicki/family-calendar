---
phase: 03-visual-polish-and-print
plan: 01
subsystem: ui
tags: [yjs, react, date-fns, vitest, tailwind]

# Dependency graph
requires:
  - phase: 02-events-and-sync
    provides: ydoc.ts with eventsMap/recurringMap/rosterMap, eventStore.ts with useSyncExternalStore pattern, people.ts roster
provides:
  - holidaysMap + birthdaysMap Y.Map exports in ydoc.ts
  - isDayHoliday, isDayBirthday, BirthdayEntry, getPrintWeeks in dates.ts
  - useHolidaysMap, useBirthdaysMap hooks in eventStore.ts
  - markHoliday, unmarkHoliday, addBirthday, removeBirthday CRUD helpers in eventStore.ts
  - useLongPress hook in src/lib/useLongPress.ts
  - --color-birthday-bg CSS token in index.css @theme block
affects: [03-02, 03-03, 03-04, 03-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "module-scope Y.Map + subscribe/getSnapshot/useSyncExternalStore for Yjs reactive state"
    - "BirthdayEntry stored as JSON string in Y.Map<string>, parsed at render time"
    - "getPrintWeeks slices generateWeeks() output using isThisWeek — no separate date math"
    - "useLongPress returns spread-able pointer handlers; onContextMenu prevents browser menu"

key-files:
  created:
    - src/lib/useLongPress.ts
    - src/lib/eventStore.holidays.test.ts
    - src/lib/useLongPress.test.ts
  modified:
    - src/lib/ydoc.ts
    - src/lib/dates.ts
    - src/lib/eventStore.ts
    - src/index.css
    - src/lib/dates.test.ts

key-decisions:
  - "CRUD helpers for holidays/birthdays take optional (map, doc) params matching addEvent/addPerson pattern — enables isolated unit testing with fresh Y.Doc"
  - "getPrintWeeks uses isThisWeek(weekStart, {weekStartsOn:0}) to locate current week in generateWeeks output — avoids duplicating date range math"
  - "DST-safe test: getPrintWeeks span comparison uses Math.round(ms/dayMs) not raw ms equality — March crossing spring DST caused 1-hour mismatch"
  - "useLongPress cancel() called in onContextMenu before onLongPress() — prevents double-fire if pointerDown was already pending"

patterns-established:
  - "Phase 3 Yjs maps: same module-scope cache + observeDeep + useSyncExternalStore pattern as Phase 2 maps"
  - "Birthday data model: Y.Map<string> with JSON values (not Y.Map<BirthdayEntry>) — Yjs requires primitive values in typed maps"

requirements-completed: [VISU-02, VISU-03, PEPL-03, PRNT-01]

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 3 Plan 01: Data and Hook Layer for Visual Features Summary

**Yjs holiday/birthday maps, useSyncExternalStore hooks, CRUD helpers, print-week slicer, useLongPress hook, and --color-birthday-bg CSS token establishing the full contract for Plans 02-04**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-12T14:29:40Z
- **Completed:** 2026-03-12T14:33:30Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added `holidaysMap` and `birthdaysMap` module-scope Y.Map exports to `ydoc.ts` — Plans 02-04 can now import and write holiday/birthday data into CRDT
- Built full Phase 3 data layer in `dates.ts`: `BirthdayEntry` interface, `isDayHoliday`, `isDayBirthday` (year-agnostic), `getPrintWeeks` (10-week slicer)
- Extended `eventStore.ts` with `useHolidaysMap`/`useBirthdaysMap` hooks and CRUD helpers (`markHoliday`, `unmarkHoliday`, `addBirthday`, `removeBirthday`) following the identical useSyncExternalStore pattern established in Phase 2
- Created `useLongPress.ts` hook with pointer event handlers and context-menu prevention for mobile long-press gesture support
- Added `--color-birthday-bg: oklch(0.95 0.08 85)` warm amber token to `index.css @theme` block
- 14 new tests across 3 test files; all 141 suite tests pass; TypeScript clean (`tsc --noEmit`)

## Task Commits

Each task was committed atomically with TDD RED then GREEN:

1. **Task 1 RED: dates.test.ts failing tests** - `b411258` (test)
2. **Task 1 GREEN: ydoc, dates, index.css** - `6e74b0d` (feat)
3. **Task 2 RED: eventStore.holidays + useLongPress failing tests** - `ba8b82a` (test)
4. **Task 2 GREEN: eventStore, useLongPress** - `213b345` (feat)

## Files Created/Modified

- `src/lib/ydoc.ts` - Added `holidaysMap` and `birthdaysMap` Y.Map exports after `rosterMap`
- `src/lib/dates.ts` - Added `BirthdayEntry`, `isDayHoliday`, `isDayBirthday`, `getPrintWeeks`; added `getMonth`, `getDate`, `isThisWeek` imports
- `src/lib/eventStore.ts` - Added `useHolidaysMap`, `useBirthdaysMap` hooks and CRUD helpers; imported new maps and `BirthdayEntry` type
- `src/index.css` - Added `--color-birthday-bg: oklch(0.95 0.08 85)` to `@theme` block
- `src/lib/useLongPress.ts` - New file: useLongPress hook with 4 pointer handlers
- `src/lib/dates.test.ts` - Extended with isDayHoliday (3), isDayBirthday (3), getPrintWeeks (3) test cases
- `src/lib/eventStore.holidays.test.ts` - New file: CRUD helper tests with fresh Y.Doc isolation
- `src/lib/useLongPress.test.ts` - New file: timer-based behavior tests with vi.useFakeTimers

## Decisions Made

- CRUD helpers accept optional `(map, doc)` params matching the `addEvent`/`addPerson` pattern — enables unit testing with fresh `Y.Doc` without polluting module-level maps
- `getPrintWeeks` uses `isThisWeek(weekStart, {weekStartsOn: 0})` to locate current week index in `generateWeeks()` output rather than duplicating date arithmetic
- DST-safe test: span comparison uses `Math.round(diff / msPerDay)` (integer days = 63) instead of exact millisecond equality — March DST transition caused 1-hour mismatch in raw ms comparison
- `cancel()` called before `onLongPress()` in `onContextMenu` to prevent double-fire when pointerDown timer is already pending

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DST-safe test for getPrintWeeks span**
- **Found during:** Task 1 (GREEN run)
- **Issue:** Test compared `tenthStart - firstStart` to `9 * 7 * 24 * 60 * 60 * 1000` (exact ms). March 8 US spring DST makes that span 1 hour short (3600000ms diff).
- **Fix:** Changed to `Math.round((tenth - first) / msPerDay)` and compared to integer `63` days.
- **Files modified:** `src/lib/dates.test.ts`
- **Verification:** Test passes; all 27 dates.test.ts tests green.
- **Committed in:** `6e74b0d` (Task 1 feat commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in test)
**Impact on plan:** Minor test fix. No scope creep. Implementation unchanged.

## Issues Encountered

None beyond the DST test fix above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All contracts for Plans 02, 03, and 04 are in place and TypeScript-verified
- Plans 02 (holiday shading), 03 (birthday highlighting), and 04 (print view) can now execute in parallel
- `useLongPress` is ready for use in DayCell or EventChip components (Plans 02/03)
- `getPrintWeeks` is ready for the print layout component (Plan 04)

---
*Phase: 03-visual-polish-and-print*
*Completed: 2026-03-12*

## Self-Check: PASSED

- All 8 source/test files verified on disk
- SUMMARY.md verified on disk
- All 4 task commits verified in git log (b411258, 6e74b0d, ba8b82a, 213b345)
- Key exports verified: holidaysMap, birthdaysMap, isDayHoliday, getPrintWeeks, useHolidaysMap, useLongPress, --color-birthday-bg
