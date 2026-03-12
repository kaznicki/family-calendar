# Phase 3: Visual Polish and Print - Research

**Researched:** 2026-03-12
**Domain:** CSS visual layering, Yjs toggle data, long-press/context-menu interaction, @media print grid layout
**Confidence:** HIGH (all critical claims verified against official docs or authoritative sources)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Holiday/vacation shading:** Manual toggle per day via long-press (mobile) / right-click (desktop) on the day column header. Context menu: "Mark as holiday" / "Unmark". Per-day granularity, any family member. Color: same `--color-weekend-bg` (oklch(0.93 0 0)). Storage: Yjs (`holidaysSet` or similar), same pattern as eventsMap. No npm holiday library, no hardcoded dates.
- **Birthday/anniversary display:** Background tint on the day column, not a chip, no slot consumed. Small label pinned above slots ("Joy's bday" or "Joy"). Color: warm gold/amber, approximately oklch(0.95 0.08 85), stored as `--color-birthday-bg` in @theme {}. Data: user-editable in SettingsPanel. Birthday entry: name (string), month (1–12), day (1–31). Recurs annually. Stored in Yjs.
- **Print range:** Next ~10 weeks from today.
- **Print content:** Main event grid only — no RecurringFooter.
- **Print constraint (Phase 1):** Use `repeat(7, 14%)` not `fr` units in print CSS.
- **Print trigger:** A print button visible in the app (placement at Claude's discretion).

### Claude's Discretion
- Exact @media print implementation vs. separate print route
- Print button placement (header, top-right floating, etc.)
- Print page orientation recommendation (landscape likely needed for 7 columns)
- Context menu styling for the holiday toggle interaction
- Exact birthday label format ("Joy's bday" vs "Joy" vs "Joy's birthday")
- How to visually layer birthday tint + holiday gray on the same day

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within Phase 3 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VISU-02 | US public holidays display with a gray background | Manual toggle via Yjs `holidaysMap`, `isDayHoliday()` helper in dates.ts, same `--color-weekend-bg` token applied inline in DayColumn |
| VISU-03 | School vacation weeks display with a gray background | Same mechanism as VISU-02 — per-day toggle covers individual days within a vacation week |
| PEPL-03 | Birthdays and anniversaries display in a dedicated special color distinct from person colors | `birthdaysMap` in Yjs, `isDayBirthday()` helper, `--color-birthday-bg: oklch(0.95 0.08 85)` CSS token, label rendered above slots in DayColumn |
| PRNT-01 | User can print the next ~10 weeks via a print button | `window.print()` triggered by print button, `@media print` CSS scope isolating a 10-week print container, `repeat(7, 14%)` columns, `@page { size: landscape }` |
</phase_requirements>

---

## Summary

Phase 3 adds three layers of visual information on top of the completed Phase 2 grid: (1) user-toggleable holiday/vacation day shading, (2) birthday/anniversary column tinting with a label, and (3) a print-ready 10-week view. All three are pure CSS and state additions — no changes to the existing event data model, no new routing.

The data model for holidays and birthdays follows the exact same module-scope Yjs + `useSyncExternalStore` pattern already established in `ydoc.ts` and `eventStore.ts`. `DayColumn.tsx` is the natural render target for all three visual states: it already receives a `date` prop and applies inline styles for `isWeekend` and `isToday`. Adding `isHoliday` and `isBirthday` booleans follows the same pattern. For printing, `@media print` CSS is the correct approach for this app (no separate route needed) — it scopes rules to a rendered print container while hiding all UI chrome.

The one genuinely new interaction pattern is the long-press / right-click context menu for toggling holidays. This is best implemented with a small custom hook (`useLongPress`) that uses a `setTimeout` against `onPointerDown` / `onPointerUp` — no third-party library needed. The native mobile context menu must be suppressed via `onContextMenu={e => e.preventDefault()}` plus the CSS property `-webkit-touch-callout: none` scoped to the day header element.

**Primary recommendation:** Use `@media print` CSS (not a separate route). Implement `holidaysMap` and `birthdaysMap` as module-scope `Y.Map<boolean>` entries in `ydoc.ts`. Extend `DayColumn.tsx` with `isHoliday` and `isBirthday` props. Implement long-press with a 500ms `setTimeout` in a custom hook. Use `@page { size: landscape }` and `repeat(7, 14%)` for print columns.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| yjs | ^13.6.29 (already installed) | `holidaysMap` and `birthdaysMap` CRDT storage | Already used for events and roster; same pattern, no new dep |
| date-fns | ^4.1.0 (already installed) | `isSameDay`, `getMonth`, `getDate` for birthday/holiday matching | Already used throughout dates.ts |
| Tailwind v4 | ^4.2.1 (already installed) | CSS token `--color-birthday-bg` in @theme {}; print-scoped utility classes | Project-standard; all theming is CSS-first in index.css |
| React | ^19.2.0 (already installed) | DayColumn, SettingsPanel, long-press hook | Project stack |
| vitest + @testing-library/react | ^4.0.18 (already installed) | Unit tests for new helpers and hooks | Already configured in vite.config.ts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| window.print() (browser built-in) | — | Programmatically open the browser print dialog | Called by the print button's onClick handler |
| @page CSS rule (browser built-in) | — | Force landscape orientation, set margins in print CSS | Inside `@media print` block in index.css |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| window.print() + @media print | react-to-print library | react-to-print adds a dependency and renders into a hidden iframe; overkill here since the entire grid is the print target — no element isolation is needed |
| Custom useLongPress hook (~15 lines) | use-long-press npm package | Adding a dep for 15 lines of code is unnecessary; the custom hook is simpler to understand and avoids versioning drift |
| Y.Map<boolean> keyed by ISO date | Y.Array or Y.Set for holidays | Y.Map<boolean> is directly queryable by key and maps 1:1 to the existing eventsMap pattern; Y.Array would require iteration |

**No new npm installs required.** All functionality is implementable with the existing stack.

---

## Architecture Patterns

### Recommended Project Structure (additions only)

```
src/
├── lib/
│   ├── ydoc.ts          # Add holidaysMap + birthdaysMap at module scope
│   ├── eventStore.ts    # Add useHolidaysMap + useBirthdaysMap hooks + CRUD helpers
│   ├── dates.ts         # Add isDayHoliday() + isDayBirthday() helpers
│   └── useLongPress.ts  # New: custom long-press hook (reusable)
├── components/
│   ├── DayColumn.tsx    # Add isHoliday, isBirthday props; render label; background layering
│   ├── DayHeader.tsx    # Optional extraction: the date-number header with long-press handler
│   ├── HolidayMenu.tsx  # New: small context menu component ("Mark as holiday"/"Unmark")
│   ├── SettingsPanel.tsx # Add "Birthdays & Anniversaries" section (CRUD list)
│   └── WeekRow.tsx      # Thread isHoliday/isBirthday booleans down to DayColumn
└── index.css            # Add --color-birthday-bg token + @media print block
```

### Pattern 1: Yjs Map for Per-Day Boolean Toggle (holidays)

**What:** Store `"2026-03-17" -> true` in a `Y.Map<boolean>`. Delete the key to "unmark" (no null values stored — clean CRDT behavior).
**When to use:** Any per-day flag that must sync across devices in real time.
**Example:**
```typescript
// In ydoc.ts — module scope, after existing maps
// Source: https://docs.yjs.dev/api/shared-types/y.map
export const holidaysMap = ydoc.getMap<boolean>('holidays')

// Mark a day as holiday
function markHoliday(isoDate: string): void {
  ydoc.transact(() => { holidaysMap.set(isoDate, true) })
}

// Unmark a day
function unmarkHoliday(isoDate: string): void {
  ydoc.transact(() => { holidaysMap.delete(isoDate) })
}

// Query
function isDayHoliday(isoDate: string): boolean {
  return holidaysMap.has(isoDate)
}
```

### Pattern 2: Yjs Map for Birthday Entries

**What:** Store birthday entries in `Y.Map<string>` where the key is a stable UUID and the value is a JSON string `{ name, month, day }`.
**When to use:** Small user-managed lists (same pattern as rosterMap).
**Example:**
```typescript
// In ydoc.ts
export const birthdaysMap = ydoc.getMap<string>('birthdays')

// Entry shape (JSON-stringified value)
interface BirthdayEntry {
  id: string
  name: string
  month: number  // 1-12
  day: number    // 1-31
}

// In eventStore.ts
export function addBirthday(entry: BirthdayEntry): void {
  ydoc.transact(() => {
    birthdaysMap.set(entry.id, JSON.stringify(entry))
  })
}

export function removeBirthday(id: string): void {
  ydoc.transact(() => { birthdaysMap.delete(id) })
}
```

### Pattern 3: useSyncExternalStore for Holidays and Birthdays

**What:** Same snapshot-cache pattern already used for eventsMap, recurringMap, and rosterMap.
**When to use:** Every new Yjs map that React components need to subscribe to.
**Example:**
```typescript
// In eventStore.ts — follows identical pattern to useRosterMap
let cachedHolidaysSnapshot: Record<string, boolean> = {}

const holidaysSubscribe = (cb: () => void) => {
  holidaysMap.observeDeep(cb)
  return () => holidaysMap.unobserveDeep(cb)
}

const getHolidaysSnapshot = (): Record<string, boolean> => {
  const fresh = JSON.stringify(holidaysMap.toJSON())
  const cached = JSON.stringify(cachedHolidaysSnapshot)
  if (fresh !== cached) cachedHolidaysSnapshot = JSON.parse(fresh)
  return cachedHolidaysSnapshot
}

export const useHolidaysMap = () =>
  useSyncExternalStore(holidaysSubscribe, getHolidaysSnapshot)
```

### Pattern 4: Long-Press + Right-Click Context Menu on Day Header

**What:** A custom hook that detects a 500ms hold and fires a callback. For desktop, `onContextMenu` fires immediately. Both show the same `HolidayMenu` popover.
**When to use:** Any touch-first + mouse interaction on calendar cells.
**Example:**
```typescript
// src/lib/useLongPress.ts
export function useLongPress(onLongPress: () => void, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = () => {
    timerRef.current = setTimeout(onLongPress, delay)
  }
  const cancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    // Prevent native mobile context menu from stealing the event:
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
      onLongPress()  // Fire immediately on desktop right-click
    },
  }
}
```

CSS required on the day header element (prevents iOS Safari long-press callout):
```css
.day-header {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
```

### Pattern 5: Birthday + Holiday Background Layering in DayColumn

**What:** Use CSS `background` shorthand with multiple layers or override specificity to let birthday tint + holiday gray coexist. The simplest approach: when both are true, show a blended or birthday-priority background. Decision: birthday tint takes visual priority when both apply (gold + gray diagonal gradient as a fallback, or simply birthday wins).
**When to use:** A day that is both a holiday AND contains a birthday (uncommon but possible).
**Recommendation:** Birthday tint takes priority (overrides holiday gray). Birthday label is more important than the gray shading — the user already knows birthdays are special.
```tsx
// In DayColumn.tsx
const bgColor = isBirthday
  ? 'var(--color-birthday-bg)'
  : isHoliday
  ? 'var(--color-weekend-bg)'
  : isWeekend
  ? 'var(--color-weekend-bg)'
  : isToday
  ? 'var(--color-today-bg)'
  : undefined

// Apply via style prop (NOT Tailwind dynamic class — v4 purges dynamic names)
<div style={{ backgroundColor: bgColor }} className="flex flex-col min-w-0">
```

### Pattern 6: @media print Grid Layout

**What:** Scope print rules to a dedicated print container. Hide all UI chrome (settings gear, RecurringFooter, print button itself) during print. Show a print-only container that renders next 10 weeks using the same `generateWeeks()` utility with a capped range.
**When to use:** Single-page app needing a print view without a separate route.
**Example:**
```css
/* In index.css */
@media print {
  /* Hide all screen-only chrome */
  .screen-only { display: none !important; }

  /* Show print container */
  .print-only { display: block !important; }

  /* 7-column grid using fixed percentages (not fr) */
  .print-grid {
    display: grid;
    grid-template-columns: repeat(7, 14%);
  }

  /* Keep each week row together on the same page when possible */
  .week-row-print {
    break-inside: avoid;
    page-break-inside: avoid; /* legacy fallback for older browsers */
  }

  /* Landscape and margins */
  @page {
    size: landscape;
    margin: 10mm 8mm;
  }
}
```

Note: `break-inside: avoid` on grid row children has inconsistent browser support per MDN. Use it on block-level wrappers around each week row, not on grid cells directly. Test in Chrome, Safari, and Firefox.

### Pattern 7: Print Button and print-only Container in React

**What:** Render a `<div className="print-only" style={{ display: 'none' }}>` in the DOM at all times (hidden on screen), populated with a 10-week slice of the calendar. Print button calls `window.print()`. The `@media print` CSS reveals the print container and hides everything else.
**Example:**
```tsx
// Print button in App.tsx header area
<button
  type="button"
  className="screen-only ..."
  onClick={() => window.print()}
>
  Print
</button>

// Print-only container (always mounted, hidden on screen)
<div className="print-only" style={{ display: 'none' }}>
  <PrintGrid weeks={printWeeks} holidays={holidays} birthdays={birthdays} />
</div>
```
The `printWeeks` are computed as `generateWeeks(today).slice(currentWeekIndex, currentWeekIndex + 10)`.

### Anti-Patterns to Avoid
- **Dynamic Tailwind class names for holiday/birthday colors:** Never `bg-[--color-birthday-bg]` or `bg-${token}`. Tailwind v4 purges these at build time. Always use `style={{ backgroundColor: 'var(--color-birthday-bg)' }}`.
- **Initializing holidaysMap or birthdaysMap inside a React component or hook:** Must be at module scope in ydoc.ts, same as eventsMap. StrictMode double-invoke creates duplicate documents.
- **Using fr units in print CSS:** Use `repeat(7, 14%)` as established in Phase 1 context. `fr` units are relative to available page-print width and can cause columns to collapse or overflow depending on browser print engine.
- **Using react-to-print for this use case:** Overkill. The entire app is the print target; no iframe isolation is needed. `window.print()` + `@media print` is simpler and has no dependency.
- **Storing boolean `true` as a Y.Array instead of Y.Map:** Querying by ISO date string as a Map key is O(1) and aligns with the existing eventsMap key structure.
- **Placing birthday label inside a slot row:** The birthday label must float above the slot rows (or be an absolutely positioned element within the DayColumn header area). It must not consume a slot row from the slot layout algorithm.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Programmatic print dialog | Custom PDF generation or canvas-based export | `window.print()` with `@media print` CSS | All major browsers support this; PDF/canvas export is enormous complexity for a fridge calendar |
| Long-press detection from scratch with touch events | Manual `touchstart`/`touchend` timing with touch coords | Custom `useLongPress` hook using `setTimeout` on `onPointerDown` (Pointer Events API) | Pointer Events unify touch/mouse/stylus; `touchstart`/`touchend` requires separate mouse fallback and is more fragile |
| Holiday calendar data (US federal holidays) | Any hardcoded list or npm date-holidays library | User manual toggle (locked decision) | User explicitly chose manual — no library needed |
| CRDT conflict resolution for toggles | Custom lock/queue logic | Yjs `Y.Map.set()` / `Y.Map.delete()` — CRDT handles it | Concurrent toggle conflicts are handled by the CRDT merge — last-write from any client converges correctly |

**Key insight:** The holiday/birthday features are fundamentally "mark a date, derive display from that mark" — the data shape is trivial and the pattern is already in the codebase. The only complexity is the interaction pattern (long-press) and print CSS.

---

## Common Pitfalls

### Pitfall 1: iOS Safari Shows Native Long-Press Callout Over Custom Menu
**What goes wrong:** User long-presses a day header on iOS; Safari shows "Copy / Look Up / Share" over the custom holiday menu.
**Why it happens:** iOS Safari fires `contextmenu` late or not at all; it shows a native callout first.
**How to avoid:** Apply `-webkit-touch-callout: none` and `-webkit-user-select: none` on the day header element. Also call `e.preventDefault()` in the `onContextMenu` handler.
**Warning signs:** Custom context menu appears behind native iOS popover during testing on a real device.

### Pitfall 2: Print Columns Collapse in Firefox/Safari
**What goes wrong:** The 7-column print grid renders as 1 or 2 columns, or columns wrap.
**Why it happens:** `fr` units are relative to the print container width which browsers compute differently. `1fr` can collapse to near zero.
**How to avoid:** Use `repeat(7, 14%)` (locked from Phase 1). The 7 × 14% = 98% leaves 2% for rounding. Test explicitly in all three browsers.
**Warning signs:** Preview in Chrome shows correct layout but Safari print dialog shows mangled columns.

### Pitfall 3: `break-inside: avoid` Not Respected in Grid Rows
**What goes wrong:** Week rows split across page breaks mid-row in Chrome or Firefox.
**Why it happens:** `break-inside: avoid` on CSS Grid children has inconsistent browser support per MDN documentation. It works on block boxes but not always on grid tracks.
**How to avoid:** Wrap each week row in a block-level `<div>` with `break-inside: avoid; page-break-inside: avoid` applied to the wrapper, not the inner grid cells.
**Warning signs:** Week rows visually split so some days appear on one page and some on the next.

### Pitfall 4: Birthday Label Takes a Slot Row
**What goes wrong:** The birthday label bumps slot assignments — events appear shifted or lose a slot row.
**Why it happens:** If the label element is rendered inside the same flex column as the EventSlot rows, it consumes vertical space that changes the slot count.
**How to avoid:** Render the birthday label in the day column header area (same `<div>` as the date number, but below or beside it), never inside the slot-generating `Array.from({ length: 4 })` block.
**Warning signs:** Days with birthdays show one fewer visible event slot.

### Pitfall 5: Holiday Toggle Fires Immediately on Desktop Right-Click
**What goes wrong:** Right-click opens browser context menu (back/inspect/etc.) instead of the holiday menu.
**Why it happens:** `onContextMenu` is not prevented by default.
**How to avoid:** Always call `e.preventDefault()` in the `onContextMenu` handler on the day header element. This suppresses the browser native menu.
**Warning signs:** Chrome DevTools context menu appears on right-click in desktop testing.

### Pitfall 6: Snapshot Identity Issue with Y.Map<boolean>
**What goes wrong:** `useHolidaysMap` re-renders all consumers on every calendar event change, not just holiday changes.
**Why it happens:** If `observeDeep` on `holidaysMap` is somehow wired to eventsMap by mistake, or if the snapshot function returns a new object reference even when data hasn't changed.
**How to avoid:** Wire `holidaysMap.observeDeep(cb)` only to the holidays subscribe function. The JSON stringify comparison in `getHolidaysSnapshot` ensures stable reference identity when data is unchanged — follow the exact same pattern as `cachedEventsSnapshot`.
**Warning signs:** DayColumn re-renders visually on event add even when no holiday data changed.

---

## Code Examples

Verified patterns from official sources and existing project code:

### Adding CSS token for birthday background
```css
/* src/index.css — inside @theme {} block */
/* Source: existing index.css pattern + https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch */
@theme {
  /* ... existing tokens ... */
  --color-birthday-bg: oklch(0.95 0.08 85);  /* warm gold/amber tint */
  /* --color-holiday-bg not needed: reuse --color-weekend-bg for gray days */
}
```

### isDayHoliday and isDayBirthday helpers
```typescript
// src/lib/dates.ts — added alongside isDayWeekend, isDayToday
import { getMonth, getDate } from 'date-fns'

export interface BirthdayEntry {
  id: string
  name: string
  month: number   // 1-12
  day: number     // 1-31
}

export function isDayHoliday(isoDate: string, holidays: Record<string, boolean>): boolean {
  return !!holidays[isoDate]
}

export function isDayBirthday(date: Date, birthdays: BirthdayEntry[]): BirthdayEntry | undefined {
  // month in BirthdayEntry is 1-indexed; date-fns getMonth is 0-indexed
  return birthdays.find(
    b => b.month === getMonth(date) + 1 && b.day === getDate(date)
  )
}
```

### Holiday context menu — minimal implementation
```tsx
// src/components/HolidayMenu.tsx
interface HolidayMenuProps {
  isHoliday: boolean
  onMark: () => void
  onUnmark: () => void
  onClose: () => void
  anchorPos: { x: number; y: number }
}

export function HolidayMenu({ isHoliday, onMark, onUnmark, onClose, anchorPos }: HolidayMenuProps) {
  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg py-1 text-sm"
      style={{ top: anchorPos.y, left: anchorPos.x }}
    >
      <button
        type="button"
        className="block w-full text-left px-4 py-1.5 hover:bg-gray-50"
        onClick={() => { isHoliday ? onUnmark() : onMark(); onClose() }}
      >
        {isHoliday ? 'Unmark holiday' : 'Mark as holiday'}
      </button>
    </div>
  )
}
```

### Print CSS block
```css
/* src/index.css — appended after @theme {} block */
/* Source: MDN @media print + @page, Phase 1 CONTEXT.md constraint */
@media screen {
  .print-only { display: none !important; }
}

@media print {
  .screen-only { display: none !important; }
  .print-only { display: block !important; }

  .print-week-grid {
    display: grid;
    grid-template-columns: repeat(7, 14%);
  }

  .print-week-row {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  @page {
    size: landscape;
    margin: 10mm 8mm;
  }
}
```

### Date range for print (next 10 weeks)
```typescript
// Compute print weeks from today
// Source: existing generateWeeks() in dates.ts
import { generateWeeks } from './dates'
import { isThisWeek } from 'date-fns'

function getPrintWeeks() {
  const allWeeks = generateWeeks()
  const currentIdx = allWeeks.findIndex(w =>
    isThisWeek(w.weekStart, { weekStartsOn: 0 })
  )
  if (currentIdx === -1) return allWeeks.slice(0, 10)
  return allWeeks.slice(currentIdx, currentIdx + 10)
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `page-break-inside: avoid` | `break-inside: avoid` (+ legacy fallback) | CSS Fragmentation Module Level 3 | Modern property; include both for cross-browser safety |
| Separate print stylesheet | `@media print` block in main CSS | Years ago | Same file, simpler build pipeline |
| `fr` units in print grids | Fixed `%` or `px` in print grids | Browser quirk, not version | `fr` in print contexts collapses unpredictably; use `repeat(7, 14%)` |
| `touchstart`/`touchend` long-press | `pointerdown`/`pointerup` with `setTimeout` | Pointer Events Level 2 widely available | Single unified API for mouse, touch, stylus |

**Deprecated/outdated in this phase:**
- `page-break-inside`: still valid for Firefox compatibility, but always pair with the modern `break-inside`
- Separate print.css file: unnecessary for this codebase; inline `@media print` in index.css is correct

---

## Open Questions

1. **Print: should multi-day spanning chips render in the print view?**
   - What we know: WeekRow renders multi-day events in a dedicated `h-7` row. The print view will likely reuse simplified week rendering.
   - What's unclear: The planner must decide whether `PrintGrid` is a simplified clone of `WeekRow` (omitting the multi-day row for simplicity) or whether it reuses full `WeekRow` components.
   - Recommendation: Use simplified print-only week rows for now (PRNT-01 only requires "clean grid" — no specific requirement for multi-day events in print). Revisit in v2 PRNT-02/03.

2. **Layering when a day is both a holiday and someone's birthday**
   - What we know: birthday tint priority is recommended above.
   - What's unclear: User has not explicitly confirmed visual priority.
   - Recommendation: Birthday tint wins (implemented in Pattern 5). If the user disagrees, it's a single `if/else` change.

3. **SettingsPanel tab structure: separate tab or inline section for birthdays?**
   - What we know: SettingsPanel is currently a single panel with "Family Members" content.
   - What's unclear: Whether the planner should add a tab strip to SettingsPanel or just append a second section below the existing family members list.
   - Recommendation: Append a second section ("Birthdays & Anniversaries") below the family members list — no tab strip needed for two sections. Keeps the component diff minimal.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | vite.config.ts (`test.globals`, `test.environment: 'jsdom'`, `test.setupFiles`) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VISU-02 | `isDayHoliday()` returns true when ISO date is in holidays map | unit | `npx vitest run src/lib/dates.test.ts` | ✅ (extend existing) |
| VISU-02 | `isDayHoliday()` returns false for dates not in map | unit | `npx vitest run src/lib/dates.test.ts` | ✅ (extend existing) |
| VISU-03 | Same as VISU-02 — per-day toggle covers vacation days | unit | same as above | ✅ (shared helper) |
| PEPL-03 | `isDayBirthday()` matches correct month+day regardless of year | unit | `npx vitest run src/lib/dates.test.ts` | ✅ (extend existing) |
| PEPL-03 | `isDayBirthday()` returns undefined when no birthday matches | unit | same | ✅ (extend existing) |
| PEPL-03 | DayColumn renders birthday label when `isBirthday` prop is set | unit | `npx vitest run src/components/DayColumn.test.tsx` | ✅ (extend existing) |
| PEPL-03 | DayColumn applies birthday background color when `isBirthday` set | unit | `npx vitest run src/components/DayColumn.test.tsx` | ✅ (extend existing) |
| VISU-02 | DayColumn applies holiday background when `isHoliday=true` | unit | `npx vitest run src/components/DayColumn.test.tsx` | ✅ (extend existing) |
| PRNT-01 | `getPrintWeeks()` returns exactly 10 weeks starting from current week | unit | `npx vitest run src/lib/dates.test.ts` | ✅ (extend existing) |

### Note on CSS variable testing in jsdom
jsdom does not evaluate CSS files, so `getComputedStyle` will not return CSS variable values. Tests for color behavior should check that the correct `var(--color-birthday-bg)` string is passed to the `style` prop, not that a computed color matches an oklch value.

```typescript
// Example: test inline style presence
const { container } = render(<DayColumn date={birthdayDate} isBirthday="Joy" ... />)
const col = container.firstChild as HTMLElement
expect(col.style.backgroundColor).toBe('var(--color-birthday-bg)')
```

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. All new tests extend existing test files (`dates.test.ts`, `DayColumn.test.tsx`).

---

## Sources

### Primary (HIGH confidence)
- Yjs official docs (https://docs.yjs.dev/api/shared-types/y.map) — Y.Map.set(), .has(), .delete(), .observe() API verified
- MDN Web Docs — `break-inside` property (https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside) — grid support caveats confirmed
- MDN Web Docs — `@page` CSS rule — landscape orientation via `size: landscape` confirmed
- Project source code (ydoc.ts, eventStore.ts, DayColumn.tsx, dates.ts, index.css) — existing patterns confirmed via direct read

### Secondary (MEDIUM confidence)
- additionalknowledge.com (2024) — `-webkit-touch-callout: none` and `-webkit-user-select: none` for iOS Safari long-press prevention, verified consistent with MDN
- MDN contextmenu event — `e.preventDefault()` to suppress native browser context menu, standard DOM API
- WebSearch: `window.print()` + `@media print` confirmed as idiomatic approach; `react-to-print` identified as unnecessary for this use case

### Tertiary (LOW confidence)
- WebSearch: `break-inside: avoid` for CSS Grid rows in print contexts — MDN confirms general caveats but browser-specific behavior (Chrome vs. Safari vs. Firefox) at print time requires manual testing. Marked LOW because runtime print rendering is not testable in jsdom.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, patterns verified against existing code
- Yjs data patterns: HIGH — Y.Map API verified against official docs; matches exactly the pattern already in use for rosterMap
- Architecture: HIGH — DayColumn/eventStore/dates.ts integration points verified by reading the actual source files
- Long-press interaction: MEDIUM — Pointer Events API is standard; iOS Safari `-webkit-touch-callout` quirk verified from recent source
- Print CSS: MEDIUM — `repeat(7, 14%)` and `@page { size: landscape }` are well-established; `break-inside` grid support is browser-dependent and needs manual validation
- Pitfalls: HIGH — most pitfalls derived from reading actual project code and documented behavior, not speculation

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable stack; CSS print behavior doesn't change frequently)
