# Phase 2: Events and Sync - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Full event CRUD, person/group color coding, multi-day spanning events, a fixed recurring schedule reference panel for all family members, and real-time collaborative sync via the existing Yjs/PartyKit scaffold. Holiday/vacation shading and print view are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Event Entry Flow
- Claude's discretion on the exact popover design — user did not discuss this area
- Requirement is locked: "inline, no separate modal" (EVNT-01)
- Suggested approach: click empty slot → small popover anchors to that slot, containing a text input and the 7 color chips in the same UI; pressing Enter or clicking away saves/dismisses

### Person / Color Assignment
- Person picker appears in the **same step** as typing — text input and color chips shown together, not as a two-step flow
- Unassigned events are **valid** — default to a neutral gray; a person/color is never required
- 7 options displayed as a **flat list** (no People vs Groups split), matching the Google Sheets layout:
  | Option        | Color (approximate, match screenshot) |
  |---------------|---------------------------------------|
  | Timur         | Salmon / coral                        |
  | Lois          | Light pink                            |
  | Joy           | Light mint green                      |
  | Ivy           | Periwinkle / lavender blue            |
  | Both girls    | Bright cyan                           |
  | Whole Family  | Bright yellow                         |
  | Other         | Light peach / tan                     |
- Color source of truth: the Google Sheets screenshot at `Family-Calendar-Google-Sheets-03-10-2026_10_53_AM.png` — match as closely as possible with oklch values in Tailwind v4 `@theme {}` tokens
- Roster management (add/remove people, rename, recolor) lives behind a **settings icon in the app header**

### Multi-Day Event Creation
- Users create multi-day events by **dragging across day slots** in the grid — click and hold on the start day, drag to the end day, release → inline popover appears to name the event and assign a person
- At week boundaries, multi-day events **split into segments per row** — a vacation Thu–Tue renders as two separate visual blocks (Thu–Sat on row N, Sun–Tue on row N+1), not a continuous wrapping band
- Multi-day events occupy a **dedicated slot row** — they always render in slot position 1 of their week row; single-day events stack in the remaining slots below

### Recurring Schedule Section
- A **fixed footer** at the bottom of the viewport, outside the scrollable calendar grid — always visible, like a reference panel
- Covers **all family members** — not just Ivy; current known recurring commitments include:
  - Timur: Capital Planning Committee meetings
  - Lois: weights sessions, yoga sessions
  - Ivy: dance classes (Hip Hop, Ballet — specific days TBD by user at setup)
- Layout: **one row per person × 7 columns (one per day of week)** — a compact grid showing that person's recurring activity on each day, or empty if none
- Each person's row is **tinted with their person color** (same colors as the main calendar) for instant visual scanning
- Editing: **click an entry to edit inline** — same click-to-edit pattern as regular events; clicking an empty cell lets you add a recurring entry for that person/day

### Real-Time Sync
- Implementation is already scaffolded: `ydoc` + `YPartyKitProvider` in `App.tsx`, `eventsMap` in `ydoc.ts`
- No additional user-facing sync UX decisions needed — Yjs handles conflict resolution transparently
- No presence indicators (cursors, "who's online") for v1 — explicitly out of scope

</decisions>

<specifics>
## Specific Ideas

- Color reference: the original Google Sheets header row screenshot (`Family-Calendar-Google-Sheets-03-10-2026_10_53_AM.png`) shows the exact hues to match — salmon for Timur, light pink for Lois, light green for Joy, periwinkle for Ivy, cyan for Both girls, yellow for Whole Family, peach for Other
- The recurring footer should feel like a "standing schedule at a glance" — quick reference, not interactive by default; editing should be possible but not the primary affordance

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EventSlot` (`src/components/EventSlot.tsx`): 28px empty div with `role="gridcell"` — Phase 2 adds click handler, event content, and drag-selection logic here
- `DayColumn` (`src/components/DayColumn.tsx`): renders 5 `EventSlot` instances — will need to receive events data from Yjs and pass down to slots
- `ydoc.ts`: `eventsMap` is `Y.Map<Y.Array<Y.Map<unknown>>>` keyed by ISO date string (`"2026-03-10"`) — schema is locked and ready for Phase 2 writes
- `App.tsx`: `YPartyKitProvider` is already created at module scope and connected — no sync wiring needed in Phase 2
- `index.css`: Tailwind v4 `@theme {}` block already has `--color-today-bg` and `--color-weekend-bg` tokens — add person color tokens here following the same pattern

### Established Patterns
- **Design tokens in `@theme {}`**: all colors are defined as `--color-{name}` and referenced as `bg-{name}` (NOT `bg-[--color-name]` — the bracket syntax omits `var()` and produces a no-op)
- **Module-scope Yjs**: `ydoc` and `provider` are at module scope in `App.tsx` / `ydoc.ts`, not inside React components — any new Yjs maps/arrays for the recurring schedule must follow this pattern
- **Derived display coordinates**: never store grid row/column in Yjs — derive at render time from canonical ISO date data

### Integration Points
- `DayColumn`: the natural place to wire Yjs data → rendered events; will observe `eventsMap` changes
- `CalendarGrid` / `App`: recurring schedule footer attaches here, outside the scrollable `overflow-y-auto` div
- `index.css` `@theme {}`: add `--color-timur`, `--color-lois`, `--color-joy`, `--color-ivy`, `--color-both-girls`, `--color-whole-family`, `--color-other` tokens

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 2 scope. Recurring events appearing in the main grid (vs the footer reference panel) deferred to a future milestone if desired.

</deferred>

---

*Phase: 02-events-and-sync*
*Context gathered: 2026-03-10*
