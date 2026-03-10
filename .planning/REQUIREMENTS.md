# Requirements: Family Calendar

**Defined:** 2026-03-10
**Core Value:** Any family member can see what's happening and add an event from any device in seconds — without needing to know how a spreadsheet works.

## v1 Requirements

### Grid & Layout

- [x] **GRID-01**: User sees a 7-column week grid (one column per day, Sun–Sat) that scrolls vertically through months and years
- [x] **GRID-02**: Each week row displays a date-range header (e.g., "May 11–17")
- [x] **GRID-03**: Each day column has multiple row slots for events, expandable when a day has more events than default slots
- [x] **GRID-04**: The current day's column is visually highlighted

### Events

- [ ] **EVNT-01**: User can add an event to a day slot inline (no separate form/modal required)
- [ ] **EVNT-02**: User can edit an existing event
- [ ] **EVNT-03**: User can delete an event
- [ ] **EVNT-04**: A multi-day event occupies a single row that spans across consecutive day-columns
- [ ] **EVNT-05**: Events can optionally include a time (not required)
- [ ] **EVNT-06**: Multiple events in the same day slot are stacked visibly without overlapping each other

### People & Colors

- [ ] **PEPL-01**: Each family member is associated with a distinct color, applied to their events
- [ ] **PEPL-02**: User assigns a person/color to an event with a single tap or click when adding or editing
- [ ] **PEPL-03**: Birthdays and anniversaries display in a dedicated special color distinct from person colors
- [ ] **PEPL-04**: User can add or remove family members and change their assigned colors (configurable roster)

### Visual Markers

- [x] **VISU-01**: Weekend columns (Saturday and Sunday) display with a gray background
- [ ] **VISU-02**: US public holidays display with a gray background
- [ ] **VISU-03**: School vacation weeks display with a gray background
- [x] **VISU-04**: The current day column is highlighted to make today easy to find

### Recurring Schedule

- [ ] **RECU-01**: A dedicated section (bottom or sidebar) displays Ivy's weekly dance schedule as a standing reference
- [ ] **RECU-02**: User can edit the recurring schedule entries via a simple form

### Sharing & Access

- [x] **SHRG-01**: A single shareable URL gives any family member full view and edit access — no login or account required
- [ ] **SHRG-02**: Multiple family members can edit the calendar simultaneously without data conflicts (real-time sync)

### Print

- [ ] **PRNT-01**: User can print the next ~10 weeks in the grid layout via a print button in the app

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
| EVNT-01 | Phase 2 | Pending |
| EVNT-02 | Phase 2 | Pending |
| EVNT-03 | Phase 2 | Pending |
| EVNT-04 | Phase 2 | Pending |
| EVNT-05 | Phase 2 | Pending |
| EVNT-06 | Phase 2 | Pending |
| PEPL-01 | Phase 2 | Pending |
| PEPL-02 | Phase 2 | Pending |
| PEPL-03 | Phase 3 | Pending |
| PEPL-04 | Phase 2 | Pending |
| VISU-01 | Phase 1 | Complete |
| VISU-02 | Phase 3 | Pending |
| VISU-03 | Phase 3 | Pending |
| VISU-04 | Phase 1 | Complete |
| RECU-01 | Phase 2 | Pending |
| RECU-02 | Phase 2 | Pending |
| SHRG-01 | Phase 1 | Complete |
| SHRG-02 | Phase 2 | Pending |
| PRNT-01 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after roadmap creation*
