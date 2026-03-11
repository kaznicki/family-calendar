---
phase: 02-events-and-sync
plan: "02"
subsystem: ui
tags: [typescript, date-fns, vitest, slot-allocation, interval-scheduling]

# Dependency graph
requires:
  - phase: 02-01
    provides: Wave 0 stub files including slotLayout.test.ts skeleton, slotLayout.ts placeholder, and project structure
provides:
  - PEOPLE array with 7 persons (timur, lois, joy, ivy, both-girls, whole-family, other) + Person interface + CalendarEvent interface
  - computeSlotLayout pure function — interval graph coloring algorithm for week row slot allocation
  - MULTI_DAY_SLOT, MAX_SLOTS constants for consumer use
  - LayoutEvent interface — input type for computeSlotLayout
  - All 8 slotLayout test cases passing (EVNT-04, EVNT-06 requirements covered)
affects:
  - 02-03 (EventCard uses PEOPLE and CalendarEvent)
  - 02-04 (EventPopover uses CalendarEvent and PEOPLE)
  - 02-05 (CalendarGrid calls computeSlotLayout at render time)
  - 02-06 (RecurringFooter uses PEOPLE)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Slot 0 reserved for multi-day events; slots 1-4 for single-day; -1 for overflow"
    - "Per-date collision tracking — non-overlapping events on different dates get the same slot"
    - "colorToken matches Tailwind v4 @theme token name — bg-{colorToken} class pattern"

key-files:
  created:
    - src/lib/people.ts
  modified:
    - src/lib/slotLayout.ts (upgraded from placeholder to full implementation with LayoutEvent + constants)
    - src/lib/slotLayout.test.ts (upgraded from it.todo() stubs to 8 real test cases)

key-decisions:
  - "LayoutEvent interface uses LayoutEvent (not SlotEvent) matching the plan spec for consistency with other plans that import this type"
  - "computeSlotLayout accepts weekStart/weekEnd params for future use (CSS segment clamping computed by callers, not the algorithm)"
  - "Per-date collision checking: two non-overlapping multi-day events in the same week both get slot 0 — matches plan Case 4 spec"
  - "colorToken = person id string — simplifies Tailwind class construction (bg-{person.colorToken})"

patterns-established:
  - "CalendarEvent: rowIndex is intentionally omitted — NEVER stored in Yjs, always derived at render time"
  - "computeSlotLayout is pure (no side effects, no Yjs, no React) — safe to call at any render depth"

requirements-completed: [EVNT-04, EVNT-06]

# Metrics
duration: 3min
completed: 2026-03-11
---

# Phase 2 Plan 02: People Config and Slot Allocation Algorithm Summary

**Pure TypeScript slot allocation algorithm (interval graph coloring) with exhaustive 8-case test suite, plus static PEOPLE config with 7 family member entries**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-11T03:08:16Z
- **Completed:** 2026-03-11T03:11:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- `people.ts` exports Person interface, CalendarEvent interface, and PEOPLE array with all 7 family members; colorToken values map directly to Tailwind v4 @theme token names
- `slotLayout.ts` exports computeSlotLayout with LayoutEvent interface, MULTI_DAY_SLOT=0, MAX_SLOTS=5 — all consumed by plans 03-06
- All 8 slotLayout test cases pass: empty input, multi-day slot 0, single-day pack 1-4, overflow -1, non-overlapping multi-day share slot 0, mixed coexistence, week-boundary clamping, cross-date non-collision

## Task Commits

Each task was committed atomically:

1. **Task 1: people.ts — Person config and CalendarEvent type** - `c04db5c` (feat)
2. **Task 2: slotLayout TDD** - `6feaa29` + `991d8ad` (test + feat — committed by plan 02-01 stub/impl cycle)

_Note: slotLayout.ts test and implementation commits carry 02-01 prefix because plan 02-01 pre-created stubs and the TDD cycle was completed within that execution context. All test cases pass and exports match this plan's spec._

## Files Created/Modified
- `src/lib/people.ts` - Person, CalendarEvent interfaces + PEOPLE[7] array
- `src/lib/slotLayout.ts` - computeSlotLayout function + LayoutEvent, MULTI_DAY_SLOT, MAX_SLOTS exports
- `src/lib/slotLayout.test.ts` - 8 exhaustive test cases for all slot allocation scenarios

## Decisions Made
- `LayoutEvent` interface name (vs `SlotEvent` in initial placeholder) — matches the plan spec and downstream consumer imports
- `weekStart`/`weekEnd` params accepted by `computeSlotLayout` but not used in slot index calculation — reserved for future CSS segment clamping helpers; collision is per-date, not per-week
- Non-overlapping multi-day events in same week both get slot 0 — consistent with plan Case 4: "slot 0 collision is checked per-day, not per-week"

## Deviations from Plan

None — plan executed exactly as written. The slotLayout.ts and slotLayout.test.ts files were pre-committed by plan 02-01's Wave 0 stub creation, with the full TDD implementation and test suite already in place. The people.ts file was created fresh in this plan's Task 1 with all required exports.

## Issues Encountered
None — all TypeScript compilation and test runs succeeded on first attempt.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `PEOPLE` and `CalendarEvent` ready for import in EventCard (plan 02-03), EventPopover (plan 02-04), and RecurringFooter (plan 02-06)
- `computeSlotLayout` ready for use in CalendarGrid/WeekRow (plan 02-05) at render time
- All 8 test cases passing — algorithm is correct before any UI integration
- Full test suite: 28 passed, 28 todo (todo stubs are Wave 0 placeholders for plans 02-03 through 02-09)

---
*Phase: 02-events-and-sync*
*Completed: 2026-03-11*
