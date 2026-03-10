# Features Research: Family Calendar Web App

## Table Stakes

Features the app must have — without these, users won't abandon Google Sheets.

| Feature | Description | Complexity |
|---------|-------------|------------|
| 7-column grid layout | Week displayed as 7-column grid with row slots per day | Medium |
| Multi-day event spanning | Events span horizontally across day-columns in same row | Medium |
| Person color coding | Each family member has a distinct color | Low |
| One-tap person assignment | Select person/color in one tap when adding event | Low |
| Link-based access | Anyone with the URL can view and edit — no login | Low |
| Mobile-responsive layout | Grid works well on phone screens | Medium |
| Print view (~10 weeks) | Clean printable grid for fridge posting | Medium |
| Weekend/holiday shading | Weekends, holidays, school vacation weeks visually distinct (gray) | Medium |
| Birthday/anniversary color | Special distinct color for recurring annual events | Low |
| Recurring schedule section | Ivy's weekly dance schedule shown separately | Medium |
| Persistent storage | Events saved — survive page refresh and browser close | Medium |
| Event times | Events can include a time (optional) | Low |
| Inline event editing | Edit event text/color directly in the grid | Medium |
| Vertical week scrolling | Scroll through months/year vertically | Low |

## Differentiators

Features that make this meaningfully better than the Google Sheet.

| Feature | Description | Complexity |
|---------|-------------|------------|
| Inline grid editing | Click a slot to add event — no modal, no form | Medium |
| Conflict stacking | Multiple events in one day slot displayed without overlap | Medium |
| Today highlight | Current day visually distinguished | Low |
| Purpose-built print layout | Designed for fridge posting from day 1 | Low |
| Fast keyboard entry | Tab through slots, type event, assign color with keyboard | Medium |
| Week-range headers | Show "May 11–17" header per row | Low |
| Configurable person roster | Add/remove family members and their colors | Low |
| Drag-to-resize multi-day | Drag edge of event to extend across days | High |

## Anti-Features

Deliberately excluded — scope creep risks.

| Feature | Reason |
|---------|--------|
| User accounts / auth | Link-based is sufficient; auth adds friction and complexity |
| Push/SMS/email notifications | Not a priority for v1 |
| Native iOS/Android app | Responsive web covers mobile sufficiently |
| Drag-and-drop across weeks | High complexity, not in existing workflow |
| iCal/Google Calendar sync | Out of scope — this replaces those tools |
| Multiple calendars | Single family calendar is the use case |
| Event invitations/RSVP | Not needed for family coordination |
| Hour-slot time scheduling | Row-per-event model is intentionally flexible |
| Comment threads | Overkill for family use |
| Undo/redo history | Adds state complexity; v1 doesn't need it |

## Feature Dependencies

- **Print view** must be designed with `@media print` CSS from day 1 — retrofitting is expensive
- **Holiday shading** requires scoping decision: hardcoded US holiday list vs. school district API
- **Person roster config** must exist before color coding can work
- **Recurring schedule section** is independent of main grid — can be built separately
- **Multi-day spanning** depends on grid layout being established first

## MVP Ordering

1. Grid layout + event display (static)
2. Event add/edit/delete + person color assignment
3. Persistent storage + link sharing
4. Weekend/holiday/birthday shading
5. Recurring schedule section
6. Print view

---
*Research completed: 2026-03-10*
