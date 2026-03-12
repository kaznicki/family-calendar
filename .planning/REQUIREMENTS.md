# Requirements: Family Calendar

**Defined:** 2026-03-10
**Updated:** 2026-03-12 (v1.1 requirements added)
**Core Value:** Any family member can see what's happening and add an event from any device in seconds — without needing to know how a spreadsheet works.

## v1.0 Requirements (Complete)

### Grid & Layout

- [x] **GRID-01**: User sees a 7-column week grid (one column per day, Sun–Sat) that scrolls vertically through months and years
- [x] **GRID-02**: Each week row displays a date-range header (e.g., "May 11–17")
- [x] **GRID-03**: Each day column has multiple row slots for events, expandable when a day has more events than default slots
- [x] **GRID-04**: The current day's column is visually highlighted

### Events

- [x] **EVNT-01**: User can add an event to a day slot inline (no separate form/modal required)
- [x] **EVNT-02**: User can edit an existing event
- [x] **EVNT-03**: User can delete an event
- [x] **EVNT-04**: A multi-day event occupies a single row that spans across consecutive day-columns
- [x] **EVNT-05**: Events can optionally include a time (not required)
- [x] **EVNT-06**: Multiple events in the same day slot are stacked visibly without overlapping each other

### People & Colors

- [x] **PEPL-01**: Each family member is associated with a distinct color, applied to their events
- [x] **PEPL-02**: User assigns a person/color to an event with a single tap or click when adding or editing
- [x] **PEPL-03**: Birthdays and anniversaries display in a dedicated special color distinct from person colors
- [x] **PEPL-04**: User can add or remove family members and change their assigned colors (configurable roster)

### Visual Markers

- [x] **VISU-01**: Weekend columns (Saturday and Sunday) display with a gray background
- [x] **VISU-02**: US public holidays display with a gray background
- [x] **VISU-03**: School vacation weeks display with a gray background
- [x] **VISU-04**: The current day column is highlighted to make today easy to find

### Recurring Schedule

- [x] **RECU-01**: A dedicated section (bottom or sidebar) displays Ivy's weekly dance schedule as a standing reference
- [x] **RECU-02**: User can edit the recurring schedule entries via a simple form

### Sharing & Access

- [x] **SHRG-01**: A single shareable URL gives any family member full view and edit access — no login or account required
- [x] **SHRG-02**: Multiple family members can edit the calendar simultaneously without data conflicts (real-time sync)

### Print

- [x] **PRNT-01**: User can print the next ~10 weeks in the grid layout via a print button in the app

## v1.1 Requirements

### Layout Fixes

- [ ] **LAYT-01**: Multi-day event chips render inside day column slots (slots 1–4) rather than a separate spanning row above the columns
- [ ] **LAYT-02**: Sticky day-name header (Sun–Sat) columns align with the grid columns below it

### Readability & Typography

- [ ] **RDBL-01**: Date numbers are bold and visually prominent; today's date has a circular highlight
- [ ] **RDBL-02**: Week range labels (e.g., "May 11–17") are large and high-contrast — immediately readable as week anchors
- [ ] **RDBL-03**: Recurring schedule footer day-of-week column headers are legible and prominent

### Settings Panel

- [ ] **STNG-01**: Settings modal action buttons have sufficient contrast (no light-grey-on-white text)
- [ ] **STNG-02**: "Add Person" button label reads "Add Person or Group"

## v2 Requirements

### Calendar Integration

- **INTG-01**: Integration with Google Calendar (workflow to be defined)
- **INTG-02**: Integration with Outlook Calendar (workflow to be defined)

### Print Enhancements

- **PRNT-02**: Grayscale-safe print — person initials or border patterns shown so colors aren't the only differentiator
- **PRNT-03**: User can choose a custom week range to print

### Recurring Events

- **RECU-03**: Rule-based recurring events with exception support (cancelled/moved occurrences)

### Access Control

- **SHRG-03**: Separate view-only link for sharing the calendar with people outside the family

## Out of Scope

| Feature | Reason |
|---------|--------|
| Push/SMS/email notifications | Not a priority for v1 |
| Native iOS/Android app | Responsive web covers mobile sufficiently |
| Multiple calendars | Single family calendar is the use case |
| Event invitations/RSVP | Not needed for family coordination |
| Undo/redo history | Adds state complexity; not in existing workflow |
| Comment threads | Overkill for family use |
| Drag-and-drop event moving | High complexity; not in existing workflow |
| Hour-slot time scheduling | Row-per-event model is intentionally flexible |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GRID-01 | Phase 1 | Complete |
| GRID-02 | Phase 1 | Complete |
| GRID-03 | Phase 1 | Complete |
| GRID-04 | Phase 1 | Complete |
| EVNT-01 | Phase 2 | Complete |
| EVNT-02 | Phase 2 | Complete |
| EVNT-03 | Phase 2 | Complete |
| EVNT-04 | Phase 2 | Complete |
| EVNT-05 | Phase 2 | Complete |
| EVNT-06 | Phase 2 | Complete |
| PEPL-01 | Phase 2 | Complete |
| PEPL-02 | Phase 2 | Complete |
| PEPL-03 | Phase 3 | Complete |
| PEPL-04 | Phase 2 | Complete |
| VISU-01 | Phase 1 | Complete |
| VISU-02 | Phase 3 | Complete |
| VISU-03 | Phase 3 | Complete |
| VISU-04 | Phase 1 | Complete |
| RECU-01 | Phase 2 | Complete |
| RECU-02 | Phase 2 | Complete |
| SHRG-01 | Phase 1 | Complete |
| SHRG-02 | Phase 2 | Complete |
| PRNT-01 | Phase 3 | Complete |
| LAYT-01 | Phase 4 | Pending |
| LAYT-02 | Phase 4 | Pending |
| RDBL-01 | Phase 5 | Pending |
| RDBL-02 | Phase 5 | Pending |
| RDBL-03 | Phase 5 | Pending |
| STNG-01 | Phase 5 | Pending |
| STNG-02 | Phase 5 | Pending |

**Coverage:**
- v1.0 requirements: 23 total — all Complete ✓
- v1.1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-12 after v1.1 milestone start*
