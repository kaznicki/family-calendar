# Roadmap: Family Calendar

## Overview

Three phases build the app in dependency order: the visual grid and project scaffold come first so the layout can be validated with real data, then full event management and real-time sync are layered on top, and finally holiday shading, birthday colors, and the print view are added as pure visual/CSS concerns that require no data model changes. Each phase delivers a coherent, verifiable capability before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Grid Scaffold** - Renderable 7-column calendar grid with date math, Yjs schema, and secure link-based access
- [ ] **Phase 2: Events and Sync** - Full event CRUD, person color coding, recurring schedule, and real-time collaborative sync
- [ ] **Phase 3: Visual Polish and Print** - Holiday/vacation shading, birthday colors, and the fridge-ready print view

## Phase Details

### Phase 1: Grid Scaffold
**Goal**: A family member can open the shareable URL and see the calendar grid with correct dates, visual markers for today and weekends, and the project infrastructure is wired up so events can be added in Phase 2.
**Depends on**: Nothing (first phase)
**Requirements**: GRID-01, GRID-02, GRID-03, GRID-04, VISU-01, VISU-04, SHRG-01
**Success Criteria** (what must be TRUE):
  1. User opens the shareable URL on any device and sees a 7-column weekly grid scrolling through months, with each week row showing a date-range header (e.g., "May 11-17")
  2. Each day column has multiple event slots visible, and weekend columns (Saturday and Sunday) display with a distinct gray background
  3. Today's column is visually highlighted so the current day is immediately obvious
  4. The grid renders correctly on a 375px mobile viewport and on desktop without layout breakage
  5. The Yjs document and PartyKit server scaffold are in place with token-protected room validation so data written in Phase 2 is secure from day one
**Plans**: 5 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffold: Vite + React + Tailwind v4 + Vitest setup and Wave 0 test stubs
- [ ] 01-02-PLAN.md — Date math + token library (TDD): generateWeeks, formatWeekRange, getTokenFromURL
- [ ] 01-03-PLAN.md — Yjs + PartyKit scaffold: ydoc singleton, YPartyKitProvider, token-validated server
- [ ] 01-04-PLAN.md — Calendar grid components: EventSlot, DayColumn, WeekRow, CalendarGrid with scroll-to-today
- [ ] 01-05-PLAN.md — Visual checkpoint: human verification of mobile layout, sticky header, today/weekend styling

### Phase 2: Events and Sync
**Goal**: Family members can add, edit, and delete events with person color coding, multi-day spanning events work without visual collision, the recurring schedule is visible, and all edits sync in real time between devices without data loss.
**Depends on**: Phase 1
**Requirements**: EVNT-01, EVNT-02, EVNT-03, EVNT-04, EVNT-05, EVNT-06, PEPL-01, PEPL-02, PEPL-04, RECU-01, RECU-02, SHRG-02
**Success Criteria** (what must be TRUE):
  1. User can add an event by clicking a day slot inline (no separate modal required), optionally enter a time, assign it to a family member with a single tap, and see it appear immediately in the correct color
  2. User can edit or delete any existing event from the grid
  3. A multi-day event (e.g., a vacation spanning Mon-Fri) appears as a single horizontal block spanning across all its day-columns without overlapping other events in the same row
  4. A second family member opening the same URL on a different device sees the other person's edits appear in real time without a page refresh, and no edits are lost when both people edit simultaneously
  5. A dedicated section displays Ivy's weekly dance schedule as a standing reference, and a family member can edit those recurring entries
**Plans**: TBD

### Phase 3: Visual Polish and Print
**Goal**: The calendar correctly marks holidays, school vacation weeks, and birthdays/anniversaries, and any family member can print the next 10 weeks in a clean grid layout suitable for posting on the fridge.
**Depends on**: Phase 2
**Requirements**: VISU-02, VISU-03, PEPL-03, PRNT-01
**Success Criteria** (what must be TRUE):
  1. US public holidays and school vacation weeks display with a gray background visually distinct from normal weekdays
  2. Birthdays and anniversaries appear in a dedicated special color that is visually distinct from all person colors
  3. User clicks a print button and the browser print dialog produces a clean grid covering the next ~10 weeks with no columns collapsing, no content overflowing, and no page-break artifacts
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
| --- | --- | --- | --- |
| 1. Grid Scaffold | 2/5 | In Progress|  |
| 2. Events and Sync | 0/TBD | Not started | - |
| 3. Visual Polish and Print | 0/TBD | Not started | - |
