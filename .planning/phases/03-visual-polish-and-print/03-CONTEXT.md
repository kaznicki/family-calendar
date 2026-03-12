# Phase 3: Visual Polish and Print - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Add holiday/vacation day shading (manual, user-toggleable), birthday/anniversary tinting with labels, and a print-ready view covering ~10 weeks. No new event types, no data model changes to events — pure visual/CSS additions layered on the existing grid. Holiday data is not automatic; users decide which days are shaded.

</domain>

<decisions>
## Implementation Decisions

### Holiday & vacation shading
- **Manual toggle per day** — no hardcoded holiday list, no npm library. Any family member marks any day as shaded from any device.
- **Trigger:** long-press (mobile) / right-click (desktop) on the day column header → context menu with "Mark as holiday" / "Unmark"
- **Per-day granularity** — individual days toggled, not whole weeks. Matches the use case where different family members have different days off.
- **Color:** same `--color-weekend-bg` (oklch(0.93 0 0)) as weekend shading — unified visual language: "gray = not a normal day"
- **Storage:** Yjs (`holidaysSet` or similar) — persists in real time across devices, same pattern as eventsMap

### Birthday/anniversary display
- **Background tint on the day column** — not a chip, no slot consumed
- **Small label at the top of the column** — e.g. "🎂 Joy" or "Joy's bday" — pinned above the event slots, doesn't take a slot row
- **Color:** warm gold/amber — approximately oklch(0.95 0.08 85), stored as `--color-birthday-bg` in @theme {}. Must be visually distinct from all 7 person colors and the weekend/holiday gray.
- **Data:** user-editable via the existing SettingsPanel — stored in Yjs. A birthday entry has: name (string), month (1–12), day (1–31). Recurs annually.

### Print layout
- Claude's discretion on implementation approach (@media print CSS vs. separate route)
- **Trigger:** a print button visible in the app (Claude decides placement — header or floating)
- **Range:** next ~10 weeks from today
- **Content:** main event grid only (no recurring footer — too dense for paper)
- **Constraint from Phase 1 CONTEXT.md:** "Print CSS: use repeat(7, 14%) not fr units; test in Chrome+Safari+Firefox"
- User did not discuss this area — full discretion on layout, orientation, and page-break handling

### Claude's Discretion
- Exact @media print implementation vs. separate print route
- Print button placement (header, top-right floating, etc.)
- Print page orientation recommendation (landscape likely needed for 7 columns)
- Context menu styling for the holiday toggle interaction
- Exact birthday label format ("🎂 Joy" vs "Joy's birthday" vs "Joy 🎂")
- How to visually layer birthday tint + holiday gray on the same day (if both apply)

</decisions>

<specifics>
## Specific Ideas

- "Let me shade holidays and vacation days manually — there are too many variations where some of us have time off and others don't" — the whole point is per-person flexibility, so the shading is day-level and user-driven, not calendar-driven
- Birthday/anniversary color should feel celebratory but not clash with the 7 person colors — warm gold/amber is the intended vibe

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `dates.ts`: `isDayWeekend`, `isDayToday` — birthday/holiday checks fit here as `isDayHoliday(date, holidaySet)` and `isDayBirthday(date, birthdayList)` following the same pattern
- `index.css` `@theme {}`: add `--color-birthday-bg: oklch(0.95 0.08 85)` and `--color-holiday-bg` (or reuse `--color-weekend-bg`)
- `SettingsPanel.tsx`: existing settings UI — birthday/anniversary management section goes here
- `DayColumn.tsx`: already receives `date: Date`; the natural place to apply holiday gray and birthday tint via inline style based on classification
- `ydoc.ts`: add a `holidaysSet: Y.Map<boolean>` keyed by ISO date string (e.g. `"2026-03-17" → true`) — same module-scope pattern as `eventsMap`

### Established Patterns
- **Module-scope Yjs**: new `holidaysSet` and `birthdaysMap` must be initialized at module scope in `ydoc.ts`, not inside React components
- **Dynamic colors via inline style**: `style={{ backgroundColor: 'var(--color-birthday-bg)' }}` — never `bg-[--color-birthday-bg]` (Tailwind v4 purges dynamic class names)
- **Design tokens in `@theme {}`**: all new color tokens follow `--color-{name}` naming convention
- **`useSyncExternalStore` pattern**: `useHolidaysMap` hook would follow the same pattern as `useEventsMap` and `useRosterMap` in `eventStore.ts`

### Integration Points
- `DayColumn.tsx`: receives `date` prop — add `isHoliday` and `isBirthday` booleans derived from Yjs state, apply background color and birthday label here
- `SettingsPanel.tsx`: add a "Birthdays & Anniversaries" section — list of entries, each with name + month/day; CRUD backed by Yjs
- Context menu on day column header: new interaction pattern — long-press handler + `onContextMenu` handler needed in `DayColumn.tsx`
- Print: `CalendarGrid` or a wrapper will need `@media print` rules or a dedicated print route slicing `generateWeeks()` to next 10 weeks

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 3 scope.

</deferred>

---

*Phase: 03-visual-polish-and-print*
*Context gathered: 2026-03-12*
