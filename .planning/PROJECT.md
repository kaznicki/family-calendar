# Family Calendar

## What This Is

A web-based family calendar that replaces a shared Google Sheet. It uses a grid layout — 7 columns (one per day of the week) scrolling vertically through time, with multiple event slots per day. Family members access it via a shared link and can add or edit events without any login. A printable view covers the next ~10 weeks and can be posted on the fridge. Multi-day events render inside day-column slots (not a separate floating row), date numbers are bold and legible on mobile, and today gets a circular blue highlight.

## Core Value

Any family member can see what's happening and add an event from any device in seconds — without needing to know how a spreadsheet works.

## Current State

**Shipped:** v1.1 Visual Polish and UX Fixes — 2026-03-13
**Deployed:** https://family-calendar-seven-pi.vercel.app/
**LOC:** ~2,875 TypeScript across 5 phases, 25 plans
**Test suite:** 173 tests, all passing

## Requirements

### Validated

- ✓ Grid calendar view (7-column, scrolling, multi-slot) — v1.0
- ✓ Link-based access, no login — v1.0
- ✓ Person/color assignment on events — v1.0
- ✓ Multi-day event spanning — v1.0
- ✓ Weekend/holiday/vacation shading — v1.0
- ✓ Birthday/anniversary special color — v1.0
- ✓ Recurring weekly schedule section — v1.0
- ✓ Print view (~10 weeks) — v1.0
- ✓ Multi-day chips render inside day column slots (slots 1–4, not separate row) — v1.1
- ✓ Sticky day-name header aligned with grid columns below — v1.1
- ✓ Date numbers bold; today has circular highlight — v1.1
- ✓ Week range labels visually prominent as row anchors — v1.1
- ✓ Recurring footer day-of-week headers legible at arm's length — v1.1
- ✓ Settings modal action buttons have sufficient contrast — v1.1
- ✓ "Add Person or Group" label in settings panel — v1.1

### Active

(None — planning next milestone)

### Out of Scope

- Push/email/SMS notifications — not a priority
- User accounts or authentication — shared link is sufficient
- Native iOS/Android app — responsive web works for both mobile and desktop
- Hour-slot time scheduling — row-per-event model is intentionally flexible
- Drag-and-drop event moving — high complexity; not in existing workflow

## Context

- v1.0 shipped all core features: grid, events, sync, holidays, birthdays, print
- v1.1 shipped the multi-day chip architectural fix and full visual/typography polish pass
- Family of 2–4 people, used daily on phones and desktop browsers
- PartyKit backend: family-calendar.kaznicki.partykit.dev

## Constraints

- **Access model**: Link-based only — no user accounts, no auth system
- **Platform**: Responsive web app — must work well on mobile and desktop browsers
- **Print**: Grid must render cleanly for physical printing
- **Stack**: Vite + React 19 + TypeScript + Tailwind v4 + Yjs + PartyKit — no stack changes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep grid layout (not traditional calendar) | Family knows this model; row-based entry is faster than form-based | ✓ Good |
| Link-based sharing (no login) | Matches current Google Sheets model; minimizes friction | ✓ Good |
| Web app (not native mobile) | Works across all devices without app store friction | ✓ Good |
| Custom CSS Grid (not FullCalendar) | Existing libs don't support row-slot scrolling model | ✓ Good |
| Y.Doc at module scope | StrictMode safe, prevents duplicate documents | ✓ Good |
| Tailwind v4 CSS-first config | No tailwind.config.js — all theming in @theme {} block | ✓ Good |
| Never use dynamic bg-${token} Tailwind classes | Tailwind v4 purges dynamic class names; use style={{ backgroundColor: var(--color-X) }} | ✓ Good |
| Removed MULTI_DAY_SLOT (slot 0) entirely — v1.1 | Separate spanning row caused visual disconnect; interval-graph coloring into real slots 1–4 is cleaner | ✓ Good |
| Sticky header nested inside scroll container — v1.1 | Prevents scrollbar-induced column drift that occurs when header is a sibling flex child | ✓ Good |
| bg-blue-600 for today badge (not a theme token) — v1.1 | Single-use color; no need to pollute @theme {}; standard Tailwind palette class is safe | ✓ Good |

---
*Last updated: 2026-03-13 after v1.1 milestone complete*
