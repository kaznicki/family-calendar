---
phase: 03-visual-polish-and-print
plan: 02
subsystem: ui
tags: [react, tailwind, yjs, long-press, context-menu]

# Dependency graph
requires:
  - phase: 03-01
    provides: useLongPress, useHolidaysMap, useBirthdaysMap, markHoliday/unmarkHoliday CRUD helpers, --color-birthday-bg token
provides:
  - HolidayMenu context menu component (right-click/long-press to mark/unmark holiday)
  - DayColumn with isHoliday + isBirthday props, priority inline-style background, birthday label
  - WeekRow threading holiday and birthday data to all DayColumn instances
affects: [03-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DayColumn background via inline style (not Tailwind class) — birthday gold > holiday gray > today blue > none priority chain"
    - "HolidayMenu backdrop dismiss: full-screen fixed div behind menu, z-index layering"
    - "Birthday label rendered above slot rows as non-slot element to preserve slot count invariant"

key-files:
  created:
    - src/components/HolidayMenu.tsx
    - src/components/DayColumn.test.tsx (updated)
  modified:
    - src/components/DayColumn.tsx
    - src/components/WeekRow.tsx

key-decisions:
  - "DayColumn background replaced from Tailwind bg-* classes to inline style to support priority ordering (birthday gold > holiday gray > today blue)"
  - "Birthday label sits above slot rows as a non-slot div — does not consume a slot index, preserving slot layout invariant"
  - "HolidayMenu positioned via fixed backdrop div for outside-click dismissal without global event listeners"

patterns-established:
  - "Inline style for dynamic color priority in DayColumn — Tailwind v4 purges dynamic class names (established in Phase 2)"
  - "Context menu via HolidayMenu + useLongPress — reusable pattern for future per-day actions"

requirements-completed: [VISU-02, VISU-03, PEPL-03]

# Metrics
duration: ~8min
completed: 2026-03-12
---

# Phase 3 Plan 02: Holiday and Birthday Grid Rendering Summary

**HolidayMenu context menu (right-click/long-press) with DayColumn inline-style priority backgrounds (birthday gold > holiday gray > today blue) and WeekRow Yjs data threading**

## Performance

- **Duration:** ~8 min
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `HolidayMenu.tsx` — context menu with Mark/Unmark holiday option, backdrop for outside-click dismissal
- Updated `DayColumn.tsx`: `isHoliday` and `isBirthday` optional props; inline-style background with priority ordering; birthday name label above slot rows; right-click/long-press via `useLongPress` opens `HolidayMenu`; `-webkit-touch-callout: none` and `user-select: none` on header
- Updated `WeekRow.tsx`: calls `useHolidaysMap` and `useBirthdaysMap`; threads `isHoliday` and `isBirthday` into each `DayColumn`
- All 147 tests pass; TypeScript clean

## Task Commits

Each task was committed atomically with TDD RED then GREEN:

1. **Task 1: Create HolidayMenu component** - `e32cc49` (feat)
2. **Task 2 RED: Failing DayColumn/WeekRow tests** - `1b30b28` (test)
3. **Task 2 GREEN: DayColumn + WeekRow + test fix** - `7ec1fc0` (feat)

## Files Created/Modified

- `src/components/HolidayMenu.tsx` - Context menu for mark/unmark holiday with backdrop dismiss
- `src/components/DayColumn.tsx` - isHoliday/isBirthday props, inline-style background priority, birthday label, long-press wiring
- `src/components/WeekRow.tsx` - useHolidaysMap/useBirthdaysMap hooks, threads data to DayColumn
- `src/components/DayColumn.test.tsx` - Updated weekend tests to expect inline style

## Decisions Made

- Background applied via inline `style` (not Tailwind class) for the 4-level priority chain — Tailwind v4 purges dynamic class names (rule established in Phase 2 decisions)
- Birthday label is a `div` above the slot rows, not occupying a slot index, preserving the `MAX_SLOTS` invariant
- Backdrop dismiss implemented via a full-screen fixed `div` behind the menu rather than a document-level click listener

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Holiday toggling fully wired end-to-end (Yjs ↔ grid rendering)
- Birthday display (background + label) wired end-to-end
- Plan 03 (birthday settings CRUD) complete in parallel
- Plan 04 (print view) complete in parallel
- Ready for human verification checkpoint (Plan 05)

---
*Phase: 03-visual-polish-and-print*
*Completed: 2026-03-12*

## Self-Check: PASSED

- HolidayMenu.tsx, DayColumn.tsx, WeekRow.tsx verified in git commits
- 3 commits verified: e32cc49, 1b30b28, 7ec1fc0
- 147 tests pass per agent report
