# Family Calendar

## What This Is

A web-based family calendar that replaces a shared Google Sheet. It uses a grid layout — 7 columns (one per day of the week) scrolling vertically through time, with multiple event slots per day. Family members access it via a shared link and can add or edit events without any login. A printable view covers the next ~10 weeks and can be posted on the fridge.

## Core Value

Any family member can see what's happening and add an event from any device in seconds — without needing to know how a spreadsheet works.

## Current Milestone: v1.1 Visual Polish and UX Fixes

**Goal:** Fix visual clarity issues and the multi-day chip layout so the app feels polished and intuitive for daily family use.

**Target features:**
- Multi-day chip refactor — chips render inside day slots (not a separate spanning row)
- Header day-name alignment — sticky Sun–Sat header aligned with columns below
- Date number styling — bolder, today gets a circle highlight
- Week label visibility — stronger typographic treatment
- Recurring footer day headers — bigger and higher contrast
- Settings modal button contrast — fix light grey + white text readability
- "Add Person" → "Add Person or Group" label copy change

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

### Active

- [ ] Multi-day chips render inside day column slots (not a separate row above)
- [ ] Sticky day-name header aligned with grid columns below
- [ ] Date numbers bolder; today has a circular highlight
- [ ] Week range labels (e.g., "May 11–17") visually prominent
- [ ] Recurring footer day-of-week headers legible and prominent
- [ ] Settings modal action buttons have sufficient contrast
- [ ] "Add Person or Group" label in settings panel

### Out of Scope

- Push/email/SMS notifications — not a priority
- User accounts or authentication — shared link is sufficient
- Native iOS/Android app — responsive web works for both mobile and desktop

## Context

- v1.0 shipped all core features: grid, events, sync, holidays, birthdays, print
- v1.1 focuses on polish and one architectural fix (multi-day chip layout)
- Family of 2–4 people, used daily on phones and desktop browsers
- Deployed: https://family-calendar-seven-pi.vercel.app/

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

---
*Last updated: 2026-03-12 after v1.0 milestone complete, v1.1 started*
