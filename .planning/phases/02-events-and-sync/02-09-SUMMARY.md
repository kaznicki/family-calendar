---
phase: 02-events-and-sync
plan: 09
subsystem: verification
tags: [human-verify, colors, sync, recurring-footer, settings]

# Dependency graph
requires:
  - phase: 02-events-and-sync/02-01 through 02-08
    provides: Full Phase 2 feature set
provides:
  - Human-verified Phase 2 completion
  - Bug fix: SettingsPanel color swatches now use inline CSS variables (same pattern as EventCard)
affects: [phase-03-visual-polish]

# Tech tracking
tech-stack:
  - component: SettingsPanel.tsx
    change: Replaced dynamic bg-${token} Tailwind classes with style={{ backgroundColor: `var(--color-${token})` }}
    reason: Tailwind v4 purges dynamic class names at build time; inline CSS variables are always available

# Summary

**Phase 2 human verification checkpoint — PASSED**

All 7 verification steps passed. One bug found and fixed during this checkpoint.

## Bug fixed: SettingsPanel color swatches blank for Joy, Ivy, Whole Family, Other

**Root cause:** SettingsPanel used dynamic Tailwind class names (`bg-${person.colorToken}`, `bg-${token}`) for color swatches. Tailwind v4 cannot statically detect these at build time, so it purges the CSS for tokens not referenced elsewhere as static strings. The four missing tokens (joy, ivy, whole-family, other) had no static Tailwind class references in the codebase.

**Fix:** Replaced both swatch usages with `style={{ backgroundColor: \`var(--color-${token})\` }}` — the same pattern already used by EventCard and EventPopover, which always worked correctly.

**Files changed:** `src/components/SettingsPanel.tsx` — two locations (person list dots + color picker buttons)

## Verification results

- ✓ Single-day event CRUD (create, edit title, delete)
- ✓ Person color chips visible and approximately match Google Sheets screenshot
- ✓ Multi-day event spanning block renders in slot row 0
- ✓ RecurringFooter stays pinned at bottom during grid scroll
- ✓ RecurringFooter cells editable
- ✓ Real-time sync confirmed between two browser tabs
- ✓ SettingsPanel opens, roster configurable (add/remove custom people)

## Decision

**Always use inline CSS variable styles for person colors** — never dynamic Tailwind class names. The pattern `style={{ backgroundColor: \`var(--color-${colorToken})\` }}` is the established convention across EventCard, EventPopover, and now SettingsPanel.
