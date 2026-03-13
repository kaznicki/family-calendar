---
phase: 05-visual-and-copy-polish
plan: "03"
subsystem: ui
tags: [react, tailwind, accessibility, wcag, settings-panel]

# Dependency graph
requires:
  - phase: 05-visual-and-copy-polish
    provides: SettingsPanel component exists with Add person label to fix
provides:
  - SettingsPanel with WCAG AA-compliant section label contrast (text-gray-700)
  - Clarified "Add Person or Group" label copy for groups like "Whole Family"
  - Automated regression tests asserting label class and text
affects: [05-visual-and-copy-polish, settings-panel]

# Tech tracking
tech-stack:
  added: []
  patterns: [TDD for Tailwind class assertion via className.toContain in RTL tests]

key-files:
  created:
    - src/components/SettingsPanel.test.tsx
  modified:
    - src/components/SettingsPanel.tsx

key-decisions:
  - "Only STNG-01 target label changed (Add Person or Group) — Birthdays & Anniversaries label intentionally left at gray-500"
  - "No additional elements modified — action buttons already have correct contrast (bg-gray-800 text-white)"

patterns-established:
  - "Tailwind class assertions: use label.className.toContain('text-gray-700') pattern for contrast checks"

requirements-completed: [STNG-01, STNG-02]

# Metrics
duration: 3min
completed: 2026-03-13
---

# Phase 5 Plan 03: Settings Panel Label Contrast and Copy Summary

**WCAG AA contrast fix (text-gray-500 to text-gray-700) and label copy update ("Add Person or Group") on the SettingsPanel Add Person section label**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T13:28:59Z
- **Completed:** 2026-03-13T13:31:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `SettingsPanel.test.tsx` with 3 RTL assertions covering STNG-01 (contrast class) and STNG-02 (label copy)
- Changed `text-gray-500` to `text-gray-700` on the "Add Person" section label (~3.9:1 to ~7:1 contrast ratio)
- Updated label text from "Add person" to "Add Person or Group" to clarify group entries are supported
- All 3 new tests pass green; no other elements in SettingsPanel.tsx were changed

## Task Commits

Each task was committed atomically:

1. **Task 1: Create failing STNG-01 and STNG-02 tests** - `832396a` (test)
2. **Task 2: Apply contrast fix and copy change** - `4971221` (feat)

**Plan metadata:** (docs commit — see below)

_Note: TDD tasks have two commits (test RED → feat GREEN)_

## Files Created/Modified

- `src/components/SettingsPanel.test.tsx` - 3 RTL tests asserting STNG-01 (class) and STNG-02 (text) requirements
- `src/components/SettingsPanel.tsx` - Line 102: `text-gray-500` → `text-gray-700`, "Add person" → "Add Person or Group"

## Decisions Made

- Only the target label was changed — "Birthdays & Anniversaries" label remains at `text-gray-500` intentionally (not in scope)
- Action buttons (bg-gray-800 text-white) were not touched — already have adequate contrast

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Full test suite shows 3 pre-existing failures in `RecurringFooter.test.tsx` (checking `text-gray-600` but finds `text-gray-400`) — these failures predate this plan and are unrelated to the SettingsPanel changes. Deferred per scope boundary rule.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- STNG-01 and STNG-02 requirements complete with automated regression coverage
- SettingsPanel section label now readable at WCAG AA for uppercase small text
- Ready for remaining visual polish tasks in Phase 5

---
*Phase: 05-visual-and-copy-polish*
*Completed: 2026-03-13*
