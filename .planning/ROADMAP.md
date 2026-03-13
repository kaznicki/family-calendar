# Roadmap: Family Calendar

## Milestones

- ✅ **v1.0 Core Calendar** — Phases 1–3 (shipped 2026-03-12)
- 🚧 **v1.1 Visual Polish and UX Fixes** — Phases 4–5 (in progress)

## Phases

<details>
<summary>✅ v1.0 Core Calendar (Phases 1–3) — SHIPPED 2026-03-12</summary>

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
- [x] 01-01-PLAN.md — Project scaffold: Vite + React + Tailwind v4 + Vitest setup and Wave 0 test stubs
- [x] 01-02-PLAN.md — Date math + token library (TDD): generateWeeks, formatWeekRange, getTokenFromURL
- [x] 01-03-PLAN.md — Yjs + PartyKit scaffold: ydoc singleton, YPartyKitProvider, token-validated server
- [x] 01-04-PLAN.md — Calendar grid components: EventSlot, DayColumn, WeekRow, CalendarGrid with scroll-to-today
- [x] 01-05-PLAN.md — Visual checkpoint: human verification of mobile layout, sticky header, today/weekend styling

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
**Plans**: 9 plans

Plans:
- [x] 02-01-PLAN.md — Wave 0 stubs: install @floating-ui/react, extend ydoc.ts, create all 11 stub files
- [x] 02-02-PLAN.md — Core logic (TDD): people.ts person config + slotLayout.ts slot allocation algorithm
- [x] 02-03-PLAN.md — Yjs store (TDD): eventStore.ts with useEventsMap, addEvent, deleteEvent, roster helpers
- [x] 02-04-PLAN.md — EventCard component: 8 person color tokens in @theme {}, colored event chip with tests
- [x] 02-05-PLAN.md — Event popover + grid wiring: EventPopover, EventSlot/DayColumn/WeekRow updated for CRUD
- [x] 02-06-PLAN.md — Multi-day events: useDragSelect hook, spanning CSS grid blocks, overflow indicator
- [x] 02-07-PLAN.md — RecurringFooter: fixed viewport-bottom reference panel, 7 people x 7 days, Yjs-backed
- [x] 02-08-PLAN.md — SettingsPanel: roster management (add/remove custom people) behind settings icon
- [x] 02-09-PLAN.md — Human verification checkpoint: CRUD, colors, drag, sync, recurring footer, settings

### Phase 3: Visual Polish and Print
**Goal**: The calendar correctly marks holidays, school vacation weeks, and birthdays/anniversaries, and any family member can print the next 10 weeks in a clean grid layout suitable for posting on the fridge.
**Depends on**: Phase 2
**Requirements**: VISU-02, VISU-03, PEPL-03, PRNT-01
**Success Criteria** (what must be TRUE):
  1. US public holidays and school vacation weeks display with a gray background visually distinct from normal weekdays
  2. Birthdays and anniversaries appear in a dedicated special color that is visually distinct from all person colors
  3. User clicks a print button and the browser print dialog produces a clean grid covering the next ~10 weeks with no columns collapsing, no content overflowing, and no page-break artifacts
**Plans**: 5 plans

Plans:
- [x] 03-01-PLAN.md — Data layer: ydoc.ts holidaysMap/birthdaysMap, eventStore.ts hooks + CRUD, dates.ts helpers, useLongPress hook, CSS token
- [x] 03-02-PLAN.md — Holiday/birthday grid rendering: HolidayMenu, DayColumn + WeekRow updates
- [x] 03-03-PLAN.md — Birthday CRUD in SettingsPanel: Birthdays & Anniversaries section
- [x] 03-04-PLAN.md — Print view: PrintGrid component, @media print CSS, print button in App.tsx
- [x] 03-05-PLAN.md — Human verification checkpoint: holiday toggle, birthday display, print layout
</details>

---

### 🚧 v1.1 Visual Polish and UX Fixes (In Progress)

**Milestone Goal:** Fix visual clarity issues and the multi-day chip layout so the app feels polished and intuitive for daily family use.

#### Phase 4: Layout Fixes
**Goal**: The multi-day chip rendering model is replaced so chips occupy real day-column slots (slots 1–4) rather than a detached spanning row, and the sticky day-name header aligns correctly with the columns below it.
**Depends on**: Phase 3
**Requirements**: LAYT-01, LAYT-02
**Success Criteria** (what must be TRUE):
  1. A multi-day event chip appears inside the day-column slot rows at the same vertical position across all days it spans — not in a separate row floating above the columns
  2. Other single-day events in the same week stack into slots that correctly account for multi-day chip occupancy, with no visual overlap
  3. The Sun–Sat day-name header row is horizontally aligned with the grid columns below it on both mobile and desktop viewports
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — slotLayout.ts TDD: interval-graph coloring replacing slot-0 spanning row model (wave 1)
- [ ] 04-02-PLAN.md — WeekRow + DayColumn: remove multi-day row, render all chips in slots 1–4 (wave 2)
- [ ] 04-03-PLAN.md — CalendarGrid.tsx: sticky header inside scroll container for column alignment (wave 1)

#### Phase 5: Visual and Copy Polish
**Goal**: Date numbers, week labels, and recurring footer headers are immediately readable without squinting, settings modal buttons have sufficient contrast, and one copy label is corrected — completing the v1.1 polish pass.
**Depends on**: Phase 4
**Requirements**: RDBL-01, RDBL-02, RDBL-03, STNG-01, STNG-02
**Success Criteria** (what must be TRUE):
  1. Today's date number is displayed with a filled circular highlight and all date numbers are bold enough to read at a glance on a phone screen
  2. The week range label (e.g., "May 11–17") is large and high-contrast — immediately identifiable as the week anchor without needing to read the individual date numbers
  3. Recurring schedule footer day-of-week column headers are legible at normal reading distance without zooming
  4. Settings modal action buttons have visible contrast (no light-grey text on white background)
  5. The "Add Person" button in the settings panel reads "Add Person or Group"
**Plans**: TBD

Plans:
- [ ] 05-01: DayColumn.tsx — bold date numbers + today circular highlight (RDBL-01)
- [ ] 05-02: WeekRow.tsx — week label typography (RDBL-02) + RecurringFooter.tsx day headers (RDBL-03)
- [ ] 05-03: SettingsPanel.tsx — button contrast (STNG-01) + label copy (STNG-02)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Milestone | Plans Complete | Status | Completed |
| --- | --- | --- | --- | --- |
| 1. Grid Scaffold | v1.0 | 5/5 | Complete | 2026-03-10 |
| 2. Events and Sync | v1.0 | 9/9 | Complete | 2026-03-12 |
| 3. Visual Polish and Print | v1.0 | 5/5 | Complete | 2026-03-12 |
| 4. Layout Fixes | 3/3 | Complete | 2026-03-13 | - |
| 5. Visual and Copy Polish | v1.1 | 0/3 | Not started | - |
