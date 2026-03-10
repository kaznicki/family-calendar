# Family Calendar

## What This Is

A web-based family calendar that replaces a shared Google Sheet. It uses a grid layout — 7 columns (one per day of the week) scrolling vertically through time, with multiple event slots per day. Family members access it via a shared link and can add or edit events without any login. A printable view covers the next ~10 weeks and can be posted on the fridge.

## Core Value

Any family member can see what's happening and add an event from any device in seconds — without needing to know how a spreadsheet works.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Grid calendar view: 7-column layout (one column per day of week), scrolling vertically through time with multiple row slots per day
- [ ] Link-based access: anyone with the URL can view and add/edit events — no login required
- [ ] One-tap person/color assignment when adding or editing an event (2–4 family members, each with a distinct color)
- [ ] Multi-day events: a single event spans horizontally across multiple day-columns in the same row
- [ ] Weekends, holidays, and school vacation weeks visually distinguished (gray background)
- [ ] Birthdays and anniversaries displayed in a distinct special color
- [ ] Recurring weekly schedule section (Ivy's dance schedule) displayed separately — position flexible (bottom or sidebar)
- [ ] Print view: renders the next ~10 weeks in a clean grid suitable for printing and posting on the fridge

### Out of Scope

- Push/email/SMS notifications — not a priority for v1
- User accounts or authentication — shared link is sufficient
- Native iOS/Android app — responsive web works for both mobile and desktop

## Context

- Currently managed in a Google Sheet with ~2459+ rows covering multiple years
- Layout: 7 columns (days of week), each day gets 7 row slots (expandable), weeks scroll vertically
- Multi-day events occupy a single row spanning across day-columns
- Pain points with Sheets: easy to accidentally break formatting, color assignment requires multiple clicks and selections
- Family of 2–4 people, used on a mix of phones and desktop browsers
- A printed copy is kept on the fridge showing the next ~10 weeks — the print feature is a real workflow requirement

## Constraints

- **Access model**: Link-based only — no user accounts, no auth system
- **Platform**: Responsive web app — must work well on mobile and desktop browsers
- **Print**: Grid must render cleanly for physical printing

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep grid layout (not traditional calendar) | Family knows this model; row-based entry is faster than form-based | — Pending |
| Link-based sharing (no login) | Matches current Google Sheets model; minimizes friction | — Pending |
| Web app (not native mobile) | Works across all devices without app store friction | — Pending |

---
*Last updated: 2026-03-10 after initialization*
