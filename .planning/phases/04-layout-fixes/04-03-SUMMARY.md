---
phase: 04-layout-fixes
plan: "03"
subsystem: ui
tags: [react, tailwind, css-grid, sticky, layout]

# Dependency graph
requires: []
provides:
  - "Sticky day-name header nested inside scroll container, eliminating column drift on all browsers"
  - "Header cells with py-2 padding and font-medium for improved readability"
affects: [04-layout-fixes, 05-readability]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sticky header inside scroll container: header shares same container width as content rows, preventing scrollbar-induced column drift"

key-files:
  created: []
  modified:
    - src/components/CalendarGrid.tsx

key-decisions:
  - "Move sticky header INSIDE scroll container rather than keeping it as a sibling flex child — ensures header and WeekRows share identical container width regardless of scrollbar presence"

patterns-established:
  - "Sticky header inside scrollable container: when header grid and content grid must align precisely, nest the sticky header inside the overflow-y-auto element rather than making it a sibling"

requirements-completed:
  - LAYT-02

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 4 Plan 03: Header Alignment Fix Summary

**Sticky day-name header moved inside scroll container to share exact column widths with WeekRows, eliminating browser-scrollbar-induced column drift**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-12T22:43:58Z
- **Completed:** 2026-03-12T22:48:00Z
- **Tasks:** 1 auto (checkpoint:human-verify pending)
- **Files modified:** 1

## Accomplishments

- Moved sticky day-name header div from a sibling flex child above the scroll body into the scroll container itself
- Header and WeekRow grids now share the same containing element width — no scrollbar offset mismatch possible
- Header cells updated: `py-1` to `py-2` for breathing room, added `font-medium` for legibility
- All critical constraints preserved: `alignSelf: start`, `pb-28`, `onPointerUp` drag handler, `RecurringFooter` outside scroll area
- TypeScript and production build both pass clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Move sticky header inside scroll container** - `d643875` (fix)

**Plan metadata:** (pending — will be added after human verification)

## Files Created/Modified

- `src/components/CalendarGrid.tsx` - Header moved inside scroll container; py-2 and font-medium added to day-name cells

## Decisions Made

- Moved header inside scroll container rather than adding a CSS workaround (e.g., `scrollbar-gutter: stable`) because the inside-container approach is simpler, more portable across browsers, and matches how the plan specified the fix.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- LAYT-02 fix is complete pending human visual verification at the checkpoint
- No blockers for Phase 5 from this plan

---
*Phase: 04-layout-fixes*
*Completed: 2026-03-12*
