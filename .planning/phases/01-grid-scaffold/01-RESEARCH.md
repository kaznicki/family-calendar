# Phase 1: Grid Scaffold - Research

**Researched:** 2026-03-10
**Domain:** Vite 6 + React 19 + Tailwind v4 + CSS Grid + date-fns v4 + Yjs + PartyKit
**Confidence:** HIGH (core stack), MEDIUM (y-partykit pre-stable API)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Grid: Custom CSS Grid (not FullCalendar) — 7 columns (Sun–Sat), scrolls vertically through months
- Stack: Vite 6 + React 19 + TypeScript + Tailwind v4 + date-fns v4 + Yjs + PartyKit on Cloudflare
- Scroll range: 6 months back, 18 months forward from today; opens scrolled to current week
- Day-name headers are sticky at viewport top; week-range headers scroll with content
- 5 event slot rows per day column, fixed height, no dynamic row growth
- All 7 columns compressed to fit 375px mobile — whole week always visible (no horizontal scroll)
- Day names shorten to single letters (M T W T F S S) on mobile
- Y.Doc initialized at module scope, not inside a React component
- PartyKit token embedded in shareable URL, validated in onBeforeConnect
- Empty slots in Phase 1 are invisible (no borders or affordance hints)
- No login, no auth UI — single shareable URL

### Claude's Discretion
- Today column highlight treatment (background tint, border style, intensity)
- Exact weekend gray shade
- Overall font, spacing, and border radius choices
- Week-range header font size on mobile

### Deferred Ideas (OUT OF SCOPE)
- Print view text wrapping — Phase 3
- Exact hex values for person colors — Phase 2
- "Today" jump button / floating nav — Phase 2
- Tap/click-to-expand full event text — Phase 2
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GRID-01 | 7-column week grid (Sun–Sat), scrolls vertically through months/years | CSS Grid `grid-template-columns: repeat(7, 1fr)` pattern; date-fns `eachWeekOfInterval` to generate week rows |
| GRID-02 | Each week row shows a date-range header (e.g., "May 11–17") | `format()` from date-fns; derive start/end of each week from `eachWeekOfInterval` output |
| GRID-03 | Each day column has multiple row slots for events | Fixed-height CSS Grid rows (or `grid-row: span N`); 5 slots per day defined in Phase 1, expandable in Phase 2 |
| GRID-04 | Current day's column is visually highlighted | `isToday()` from date-fns; apply Tailwind conditional class to day column header and slot column |
| VISU-01 | Weekend columns (Sat + Sun) display with gray background | `isSaturday()` / `isSunday()` from date-fns; conditional Tailwind background class on each column |
| VISU-04 | Current day column highlighted — today easy to find | Same as GRID-04; accent color on column header; subtle tint on slot cells |
| SHRG-01 | Single shareable URL gives full view + edit access — no login | Token embedded in URL hash or query param; `YPartyKitProvider` `params` option passes token to PartyKit `onBeforeConnect` for validation |
</phase_requirements>

---

## Summary

Phase 1 builds the entire visible scaffold: project wiring, grid layout, date math, and the real-time sync infrastructure. It is greenfield — no existing code to integrate with.

The grid is a custom CSS Grid layout, not a third-party calendar library. The most technically tricky part of this phase is the sticky day-name header row combined with a vertically scrolling grid body. CSS Grid `position: sticky` on header cells requires `align-self: start` to override the default `stretch` behavior that breaks stickiness. Mobile compression (all 7 columns in 375px) is non-negotiable and should be designed first, not retrofitted.

The Yjs/PartyKit scaffold can be minimal in Phase 1 — the Y.Doc structure (a `Y.Map` keyed by ISO date) needs to exist and connect, but no events will be written until Phase 2. The token-based access control must be wired in Phase 1 via `onBeforeConnect`; retrofitting auth after Phase 2 events exist is painful. `y-partykit` is at version `0.0.33` (pre-stable semver) — treat its API as stable enough to use but verify the exact import paths before coding.

**Primary recommendation:** Build mobile-first (375px, 7 squeezed columns), then add desktop styles. Wire the real-time scaffold with an empty Y.Doc before any grid rendering. Test date math with Vitest unit tests on the week-generation logic before wiring it to React.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 6.x | Build tool + dev server | Fastest HMR, first-class React+TS template |
| React | 19.x | UI framework | Latest stable; concurrent rendering |
| TypeScript | 5.x | Type safety | Included in Vite react-ts template |
| Tailwind CSS | 4.x | Utility CSS | Zero config with Vite plugin; CSS-first theming |
| date-fns | 4.x | Date arithmetic | Tree-shakable, no side effects; v4 adds TZ support |
| yjs | ^13.6 | CRDT shared data types | Battle-tested; prevents last-write-wins conflicts |
| y-partykit | 0.0.33 | Yjs ↔ PartyKit bridge | Official PartyKit adapter for Yjs |
| partykit | latest | Cloudflare-hosted WebSocket server | Only WS host that holds connections across requests |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tailwindcss/vite | 4.x | Tailwind Vite plugin | Required for v4 Vite integration |
| @vitejs/plugin-react | 4.x | React Fast Refresh | Part of Vite react-ts template |
| vitest | 3.x | Unit testing | Same config as Vite; zero extra setup |
| @testing-library/react | 16.x | Component tests | Standard companion to Vitest |
| jsdom | 26.x | DOM environment for tests | Required by Vitest for React component tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom CSS Grid | FullCalendar | FullCalendar doesn't support the row-slot scrolling model (locked decision) |
| date-fns | Temporal API | Temporal is not yet baseline across all browsers |
| y-partykit | y-websocket | Would require hosting a separate WS server; PartyKit is Cloudflare-native |

**Installation:**
```bash
# Scaffold
npm create vite@latest family-calendar -- --template react-ts

# Core dependencies
npm install date-fns yjs y-partykit

# Tailwind v4 (Vite plugin approach)
npm install tailwindcss @tailwindcss/vite

# PartyKit server tooling (dev + deploy)
npm install -D partykit

# Test infrastructure
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom
```

---

## Architecture Patterns

### Recommended Project Structure
```
family-calendar/
├── src/
│   ├── main.tsx               # App entry; Y.Doc initialized at module scope here
│   ├── App.tsx                # Provider wrapper (YPartyKitProvider)
│   ├── components/
│   │   ├── CalendarGrid.tsx   # Outer grid container; generates week rows
│   │   ├── WeekRow.tsx        # One week: 7 DayColumn cells + week-range header
│   │   ├── DayColumn.tsx      # One day: date header + 5 EventSlot cells
│   │   └── EventSlot.tsx      # Single slot cell (empty in Phase 1)
│   ├── lib/
│   │   ├── dates.ts           # Date math helpers (generateWeeks, formatWeekRange)
│   │   ├── ydoc.ts            # Y.Doc instance + Y.Map schema (module-scope singleton)
│   │   └── token.ts           # Read token from URL; pass to provider params
│   └── index.css              # @import "tailwindcss" + @theme customizations
├── party/
│   └── server.ts              # PartyKit server — onBeforeConnect token check + onConnect Yjs bridge
├── partykit.json              # { "name": "family-calendar", "main": "party/server.ts" }
├── vite.config.ts             # @tailwindcss/vite plugin + vitest config
└── vitest.config.ts           # (or inline in vite.config.ts)
```

### Pattern 1: Y.Doc at Module Scope
**What:** Create the single `Y.Doc` instance in a dedicated module (`src/lib/ydoc.ts`), not inside any React component or hook.
**When to use:** Always — every time. This is the most critical architectural constraint for Yjs in React.

```typescript
// src/lib/ydoc.ts
// Source: https://docs.yjs.dev/getting-started/y-doc
import * as Y from 'yjs'

// Single document for the entire app — created once at module load
export const ydoc = new Y.Doc()

// Calendar events map: keys are ISO date strings ("2026-03-10"),
// values are Y.Array<Y.Map<unknown>> (one entry per event slot)
export const eventsMap = ydoc.getMap<Y.Array<Y.Map<unknown>>>('events')
```

**Why module scope:** If `new Y.Doc()` is inside a React component or `useMemo`, each re-render/StrictMode double-invoke creates a new document, breaking sync state.

### Pattern 2: YPartyKitProvider Setup with Token Auth
**What:** Wrap the app with `YPartyKitProvider` (or `useYProvider` hook) and pass the URL token in `params`.
**When to use:** App root (`App.tsx`), wrapping all calendar components.

```typescript
// src/lib/token.ts
export function getTokenFromURL(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('token') ?? ''
}
```

```typescript
// src/App.tsx
// Source: https://docs.partykit.io/reference/y-partykit-api/
import YPartyKitProvider from 'y-partykit/provider'
import { ydoc } from './lib/ydoc'
import { getTokenFromURL } from './lib/token'

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999'

const provider = new YPartyKitProvider(PARTYKIT_HOST, 'family-calendar', ydoc, {
  params: async () => ({ token: getTokenFromURL() }),
})
// Provider is created once outside the component tree
```

**Note:** `useYProvider` from `y-partykit/react` is an alternative for creating the provider inside a component, but it re-creates on re-render unless the `doc` reference is stable. Prefer the module-scope approach.

### Pattern 3: PartyKit Server with Token Validation
**What:** Validate the token in `onBeforeConnect` (edge middleware) before the WS upgrade. This runs at the Cloudflare edge, close to users.
**When to use:** Every PartyKit server that handles untrusted clients.

```typescript
// party/server.ts
// Source: https://docs.partykit.io/guides/authentication/
import type * as Party from 'partykit/server'
import { onConnect } from 'y-partykit'

const SECRET_TOKEN = process.env.CALENDAR_TOKEN ?? ''

export default class CalendarServer implements Party.Server {
  constructor(public party: Party.Room) {}

  // onBeforeConnect runs at the EDGE before the WebSocket upgrade
  static async onBeforeConnect(request: Party.Request): Promise<Response | void> {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    if (!token || token !== SECRET_TOKEN) {
      return new Response('Unauthorized', { status: 401 })
    }
    // Allow connection to proceed
  }

  onConnect(conn: Party.Connection) {
    return onConnect(conn, this.party, {
      persist: { mode: 'snapshot' },
    })
  }
}

export const handler = CalendarServer
```

**Token generation strategy:** Generate a random 32-char hex string once, store as `CALENDAR_TOKEN` env var in PartyKit, embed it in the shared URL query string. The URL is the password.

### Pattern 4: CSS Grid Calendar with Sticky Day Headers
**What:** A single CSS Grid that lays out all 7 day columns, with the header row sticky at `top: 0`.
**When to use:** The outer `CalendarGrid` component.

```css
/* The sticky header row trick:
   CSS Grid's default align-items: stretch makes sticky fail.
   Setting the grid container's align-items to start fixes it. */

.calendar-grid-outer {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100dvh;
  overflow: hidden;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  align-self: start; /* CRITICAL: overrides stretch to allow sticky */
}

.calendar-body {
  overflow-y: auto;
  /* Each week row is a nested 7-column grid */
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

/* Mobile: 7 columns in 375px = ~53px each column */
/* Use minmax(0, 1fr) to prevent overflow */
.day-headers,
.week-row {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
```

**Tailwind v4 equivalent:**
```html
<!-- Day header strip -->
<div class="grid grid-cols-7 sticky top-0 z-10 bg-white">
  <!-- Day name cells -->
</div>

<!-- Scrollable body -->
<div class="overflow-y-auto">
  <!-- Each week row -->
  <div class="grid grid-cols-7">
    <!-- Day columns with 5 slot rows each -->
  </div>
</div>
```

### Pattern 5: Week Generation with date-fns
**What:** Generate the list of weeks to render using `eachWeekOfInterval`.
**When to use:** `src/lib/dates.ts` — call once, memoize in React.

```typescript
// src/lib/dates.ts
// Source: https://date-fns.org/docs/eachWeekOfInterval
import {
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  format,
  isToday,
  isSaturday,
  isSunday,
  addDays,
} from 'date-fns'

export function generateWeeks(today: Date = new Date()) {
  const start = subMonths(today, 6)
  const end = addMonths(today, 18)

  // weekStartsOn: 0 = Sunday (matches requirements: Sun-Sat columns)
  const weekStarts = eachWeekOfInterval(
    { start, end },
    { weekStartsOn: 0 }
  )

  return weekStarts.map((weekStart) => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    return {
      weekStart,
      weekEnd: days[6],
      days,
      label: formatWeekRange(weekStart, days[6]),
    }
  })
}

export function formatWeekRange(start: Date, end: Date): string {
  // "May 11–17" or "May 28–Jun 3" when month changes
  if (format(start, 'MMM') === format(end, 'MMM')) {
    return `${format(start, 'MMM d')}–${format(end, 'd')}`
  }
  return `${format(start, 'MMM d')}–${format(end, 'MMM d')}`
}

export function isDayWeekend(date: Date): boolean {
  return isSaturday(date) || isSunday(date)
}

export function isDayToday(date: Date): boolean {
  return isToday(date)
}
```

### Anti-Patterns to Avoid
- **Y.Doc inside a React component:** Creates a new document on every render cycle, destroying sync state. Always module scope.
- **Storing display coordinates in Yjs:** Never store grid row/column positions in Yjs. Derive them at render time from canonical data (ISO date, personId). Only Phase 2 concern, but schema decisions made in Phase 1 must allow this.
- **Using FullCalendar or a calendar library:** They own the grid layout model and won't support row-slot scrolling without deep hacks.
- **`grid-template-columns: repeat(7, 1fr)` without `minmax(0, 1fr)`:** Plain `1fr` overflows on narrow viewports when content is wide. Use `minmax(0, 1fr)` for compression.
- **Forgetting `align-self: start` on sticky header:** The sticky header will not stick inside a CSS Grid without this override.
- **Using `overflow: hidden` on a parent of `position: sticky`:** Any ancestor with `overflow: hidden/auto/scroll` between the sticky element and the scroll container breaks sticky.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date iteration | Manual week loop with getDay() arithmetic | `date-fns eachWeekOfInterval` | DST transitions, month boundaries, leap years |
| Week formatting | Manual month/day string construction | `date-fns format()` | Locale edge cases, ordinal handling |
| CRDT merging | Custom conflict resolution for concurrent edits | `yjs Y.Map` | CRDT is a research-level problem; Yjs handles merge correctly |
| WebSocket persistence | DIY broadcast + storage | `y-partykit onConnect` with `persist: snapshot` | PartyKit handles reconnection, history compaction |
| Token-in-URL reading | `location.href.split('?')[1]` | `new URLSearchParams(window.location.search)` | Handles encoding, multiple params |

**Key insight:** The date math and CRDT merge logic are both deceptively complex. date-fns and Yjs are the entire reason we're not rewriting them.

---

## Common Pitfalls

### Pitfall 1: Sticky Headers Broken by CSS Grid Stretch
**What goes wrong:** Day-name header row scrolls away with content instead of sticking.
**Why it happens:** CSS Grid sets `align-items: stretch` by default, expanding children to fill the grid track height. `position: sticky` requires the element to have a defined natural height, but `stretch` overrides this.
**How to avoid:** Add `align-self: start` to the sticky header element, or set `align-items: start` on the grid container.
**Warning signs:** Header sticks in simple demos but scrolls in a multi-row grid layout.

### Pitfall 2: Mobile Column Overflow
**What goes wrong:** 7 columns push horizontally, creating horizontal scroll or collapsing below the fold.
**Why it happens:** `grid-template-columns: repeat(7, 1fr)` distributes space, but if a column has min-content larger than available, the grid expands. Also: padding, borders, and gap add up.
**How to avoid:** Use `repeat(7, minmax(0, 1fr))`. Keep day names to single characters on mobile. Avoid horizontal padding larger than 2px per column.
**Warning signs:** Test at exactly 375px width (iPhone SE / standard mobile breakpoint).

### Pitfall 3: Scroll Position Not Restored to Today
**What goes wrong:** Grid renders from the beginning of the 6-months-back range, requiring the user to scroll to today.
**Why it happens:** The browser renders from the top of the scroll container by default.
**How to avoid:** Use `useEffect` with a `ref` on the "today" week row and call `scrollIntoView({ block: 'start', behavior: 'instant' })` on first mount.
**Warning signs:** User sees dates from 6 months ago on load instead of this week.

### Pitfall 4: Y.Doc Created Inside React StrictMode Double-Invoke
**What goes wrong:** In React 19 StrictMode, effects run twice in development. If `new Y.Doc()` is inside a `useEffect`, you get two documents.
**Why it happens:** StrictMode intentionally mounts/unmounts/remounts to surface bugs.
**How to avoid:** Module scope (Pattern 1 above). The Y.Doc is created when the module is loaded — once, before React runs.
**Warning signs:** Sync works in production but breaks oddly in development.

### Pitfall 5: PartyKit Token Never Validated
**What goes wrong:** Any person who guesses the room name can read and write calendar data.
**Why it happens:** `onBeforeConnect` is not called automatically — you must implement it.
**How to avoid:** Always implement `static onBeforeConnect` before going beyond localhost. The token must be validated in Phase 1; do not defer to Phase 2.
**Warning signs:** Connecting to the PartyKit room from a fresh browser tab with no token succeeds.

### Pitfall 6: `overflow: hidden` Ancestor Breaking Sticky
**What goes wrong:** `position: sticky` silently stops working.
**Why it happens:** Any `overflow: hidden`, `overflow: auto`, or `overflow: scroll` on a DOM ancestor between the sticky element and the scroll container acts as the scroll boundary, trapping sticky within it.
**How to avoid:** Audit every ancestor of the sticky header. Only the designated scroll container (the calendar body `div`) should have `overflow-y: auto`. Everything else should be `overflow: visible`.
**Warning signs:** Works in isolation CodePen but not in the app.

### Pitfall 7: y-partykit Pre-Stable API Drift
**What goes wrong:** Import paths or server handler signatures change between `0.0.x` versions.
**Why it happens:** `y-partykit@0.0.33` is pre-1.0; the API is functionally stable but not semver-guaranteed.
**How to avoid:** Pin the version in `package.json` (`"y-partykit": "0.0.33"`). Check the CHANGELOG before upgrading.
**Warning signs:** TypeScript errors on `onConnect` call signature after `npm update`.

---

## Code Examples

Verified patterns from official sources:

### Tailwind v4 Vite Setup
```typescript
// vite.config.ts
// Source: https://tailwindcss.com/blog/tailwindcss-v4
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* Override or extend Tailwind theme here — no tailwind.config.js needed */
  --color-today-bg: oklch(0.97 0.02 240);      /* subtle blue tint for today */
  --color-weekend-bg: oklch(0.97 0 0);          /* barely-off-white for weekends */
}
```

### partykit.json
```json
{
  "name": "family-calendar",
  "main": "party/server.ts"
}
```

### Vitest Setup File
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

### Scroll to Today on Mount
```typescript
// src/components/CalendarGrid.tsx
import { useEffect, useRef } from 'react'
import { isThisWeek } from 'date-fns'

export function CalendarGrid({ weeks }) {
  const todayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    todayRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, []) // Empty deps: run once on mount

  return (
    <div className="overflow-y-auto h-[calc(100dvh-var(--header-height))]">
      {weeks.map((week) => (
        <div
          key={week.weekStart.toISOString()}
          ref={isThisWeek(week.weekStart) ? todayRef : undefined}
        >
          {/* WeekRow content */}
        </div>
      ))}
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` | CSS-first `@theme {}` block in CSS file | Tailwind v4 (Jan 2025) | No JS config file needed |
| PostCSS plugin | First-party `@tailwindcss/vite` Vite plugin | Tailwind v4 | Faster builds; single import |
| Jest for Vite projects | Vitest | 2023+, stable in 2024 | Zero config; shares Vite build |
| `useEffect` + `useState` for external stores | `useSyncExternalStore` | React 18+ | Correct for concurrent rendering; avoid tearing |
| `Y.Text` for all Yjs data | `Y.Map` keyed by date + `Y.Array` per slot | N/A (design pattern) | Enables efficient lookup by date |

**Deprecated/outdated:**
- `tailwind.config.js` with `content` array: Not needed in v4; auto-detects files
- `postcss.config.js` with tailwindcss plugin: Use `@tailwindcss/vite` instead for Vite projects
- `YPartyKitProvider` `disconnect` option: Use `provider.disconnect()` method call instead

---

## Open Questions

1. **y-partykit version stability**
   - What we know: Latest is `0.0.33`, published ~9 months ago (mid-2025)
   - What's unclear: Whether the move to Cloudflare's ownership of PartyKit has changed the recommended package (`partyserver` / `y-partyserver` exists as a potential replacement)
   - Recommendation: Check `y-partyserver` on npm before starting Phase 1 implementation; if it has a higher version and recent activity, use it instead

2. **PartyKit Cloudflare account requirement**
   - What we know: `partykit deploy` requires a PartyKit/Cloudflare account
   - What's unclear: Whether a local dev environment with `partykit dev` is sufficient for Phase 1 verification
   - Recommendation: Phase 1 can run entirely on `localhost:1999` with `npx partykit dev`; account setup is needed for Phase 2 shareability testing

3. **`dvh` units browser support**
   - What we know: `100dvh` (dynamic viewport height) solves the mobile address-bar resize problem; supported in all modern browsers since mid-2023
   - What's unclear: Whether the Windows 11 dev environment has an older browser installed for testing
   - Recommendation: Use `100dvh` with `100vh` fallback: `height: 100vh; height: 100dvh`

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | `vite.config.ts` (inline `test` block) |
| Quick run command | `npx vitest run --reporter=dot` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GRID-01 | `generateWeeks()` returns correct week count for 24-month range | unit | `npx vitest run src/lib/dates.test.ts -t "generateWeeks"` | Wave 0 |
| GRID-02 | `formatWeekRange()` formats "May 11–17" and cross-month "May 28–Jun 3" | unit | `npx vitest run src/lib/dates.test.ts -t "formatWeekRange"` | Wave 0 |
| GRID-03 | `WeekRow` renders 7 `DayColumn` children, each with 5 slot divs | component | `npx vitest run src/components/WeekRow.test.tsx` | Wave 0 |
| GRID-04 | Today's date column has `data-today="true"` attribute | component | `npx vitest run src/components/DayColumn.test.tsx -t "today"` | Wave 0 |
| VISU-01 | Saturday and Sunday columns have weekend class | component | `npx vitest run src/components/DayColumn.test.tsx -t "weekend"` | Wave 0 |
| VISU-04 | Same as GRID-04 — today column highlighted | component | Same as GRID-04 | Wave 0 |
| SHRG-01 | `getTokenFromURL()` reads `?token=` param from location | unit | `npx vitest run src/lib/token.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/dates.test.ts` (fast, pure functions)
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/dates.test.ts` — covers GRID-01, GRID-02
- [ ] `src/lib/token.test.ts` — covers SHRG-01
- [ ] `src/components/WeekRow.test.tsx` — covers GRID-03
- [ ] `src/components/DayColumn.test.tsx` — covers GRID-04, VISU-01, VISU-04
- [ ] `src/test/setup.ts` — shared test setup (jest-dom + cleanup)
- [ ] Framework install: `npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom`

---

## Sources

### Primary (HIGH confidence)
- `https://docs.partykit.io/reference/y-partykit-api/` — YPartyKitProvider API, useYProvider, server onConnect
- `https://docs.partykit.io/guides/authentication/` — onBeforeConnect token validation pattern
- `https://docs.partykit.io/reference/partyserver-api/` — Party.Server API, connection rejection
- `https://docs.partykit.io/reference/partykit-configuration/` — partykit.json schema
- `https://docs.yjs.dev/api/shared-types/y.map` — Y.Map API, nesting pattern
- `https://tailwindcss.com/blog/tailwindcss-v4` — Tailwind v4 Vite plugin setup, @theme CSS config
- `https://vite.dev/guide/` — Vite 6 scaffold command, Node.js requirements
- `https://ishadeed.com/article/position-sticky-css-grid/` — align-self: start fix for sticky in CSS Grid

### Secondary (MEDIUM confidence)
- `https://blog.date-fns.org/v40-with-time-zone-support/` — date-fns v4 release notes (no breaking API changes to core functions)
- `https://vitest.dev/guide/` — Vitest setup with Vite, jsdom environment
- `https://css-tricks.com/how-to-use-css-grid-for-sticky-headers-and-footers/` — sticky + grid pattern

### Tertiary (LOW confidence, needs validation)
- WebSearch result: y-partykit latest is `0.0.33` — verify with `npm info y-partykit version` before Phase 1 coding
- WebSearch result: `y-partyserver` may be the newer alternative — check npm activity

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Vite, React, Tailwind v4 all verified via official docs; date-fns v4 has no breaking API changes per official release blog
- Architecture: HIGH — CSS Grid sticky pattern verified via ishadeed.com; Y.Doc module-scope pattern from official Yjs docs; PartyKit auth from official docs
- Pitfalls: HIGH — sticky/overflow issues are well-documented CSS behaviors; Y.Doc double-create is a known React StrictMode issue documented in Yjs community; token-skipping is a straightforward logical pitfall
- y-partykit version: MEDIUM — version number from WebSearch, pre-stable semver, verify before use

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (Tailwind v4 and y-partykit are active projects; recheck if > 30 days)
