# Project Research Summary

**Project:** family-calendar
**Domain:** Shared family calendar web app (grid layout, link-based access, real-time CRDT sync)
**Researched:** 2026-03-10
**Confidence:** HIGH

## Executive Summary

This is a purpose-built collaborative calendar replacing a Google Sheets grid — not a general-purpose scheduling SaaS. The core challenge is threefold: (1) a custom CSS Grid that models a scrollable week-row layout with multi-day event spans, (2) conflict-free real-time sync for concurrent family edits without corrupting data, and (3) a print layout designed for fridge posting from day one. All four research areas converge on a single architecture: Vite/React SPA + Yjs CRDT + PartyKit on Cloudflare. There is no REST API, no auth system, and no server-side rendering — just a static frontend synchronized through a Cloudflare Durable Object.

The recommended stack is well-matched to the problem. Yjs's CRDT model eliminates the last-write-wins corruption risk that would affect Firebase or Supabase Realtime under concurrent edits. PartyKit on Cloudflare solves the Vercel WebSocket problem (Vercel serverless functions cannot hold WebSocket connections), runs on the free tier, and is now a first-party Cloudflare product. The custom CSS Grid — rather than FullCalendar or React Big Calendar — is the correct choice because existing calendar libraries don't model the row-slot scrolling grid that defines this app's UX.

The three non-negotiable risk areas from research are: (1) the multi-day event slot allocation algorithm, which requires interval scheduling logic with unit tests and is the hardest piece of custom code in the project; (2) CSS Grid print layout, which breaks in non-obvious ways across browsers and must be designed in from the start with percentage-based columns and `break-inside: avoid` guards; and (3) Y.Doc lifecycle management in React, which is a known footgun that must be addressed on day one to prevent data loss in development.

## Key Findings

### Recommended Stack

The stack is opinionated and infrastructure-light. The SPA (Vite 6 + React 19 + TypeScript 5) deploys as a static `dist/` folder to Cloudflare Pages — no server, no vendor lock-in. The real-time backend is a PartyKit server (one file, Cloudflare Durable Object) accessed via the `y-partykit` WebSocket provider. Yjs manages all shared calendar state as CRDTs; Zustand handles local UI state only (which day is selected, print mode toggle). Tailwind v4 with its Vite-native plugin covers both screen and print layouts cleanly. shadcn/ui provides accessible dialog and popover primitives without library lock-in.

**Core technologies:**
- React 19 + Vite 6: UI rendering and build — standard SPA pairing, static deployment, no SSR needed
- TypeScript 5: Type safety — calendar date arithmetic is bug-prone without types
- Tailwind CSS v4: Styling — `print:` variant and container queries cover all layout needs; CSS-first config with the Vite plugin
- date-fns v4: Date arithmetic — pure functional, fully typed, tree-shakeable; purpose-built calendar functions (`eachWeekOfInterval`, `differenceInCalendarDays`, `isWithinInterval`)
- Yjs 13 + y-partykit: CRDT real-time sync — conflict-free concurrent edits, IndexedDB offline persistence, no central locking
- PartyKit (Cloudflare): WebSocket backend — Durable Objects with SQLite, free tier, acquired by Cloudflare in 2024
- Zustand 5: Local UI state only — Yjs owns shared data; Zustand owns ephemeral UI state
- shadcn/ui: Accessible dialog/popover components — copy-paste, owns the code, no library lock-in

**What not to use:** Next.js + Vercel (WebSocket incompatibility), FullCalendar/React Big Calendar (wrong layout model), Firebase/Supabase Realtime (no CRDT, last-write-wins corruption), Redux (unnecessary boilerplate given Yjs), the Temporal API (Safari/Firefox support incomplete as of early 2026).

### Expected Features

Features research identified 14 table-stakes and 8 differentiator features, with a clear MVP ordering that matches the architecture build order.

**Must have (table stakes):**
- 7-column CSS Grid with week rows and row slots — the core layout model
- Multi-day event spanning across day-columns in the same row
- Person color coding with one-tap assignment
- Link-based access (no login)
- Mobile-responsive layout (375px viewport usable)
- Print view of ~10 weeks for fridge posting
- Weekend/holiday/school vacation shading
- Birthday/anniversary distinct color
- Recurring schedule section (Ivy's dance schedule)
- Persistent storage surviving refresh and browser close
- Inline event editing directly in the grid
- Vertical scrolling through weeks

**Should have (differentiators):**
- Inline slot editing (click slot, no modal)
- Conflict stacking (multiple events per slot without visual overlap)
- Today highlight
- Fast keyboard entry (Tab through slots, assign color with keyboard)
- Week-range headers ("May 11-17" per row)
- Configurable person roster (add/remove family members and colors)

**Defer to v2+:**
- Drag-to-resize multi-day events (high complexity)
- Push/SMS/email notifications
- iCal/Google Calendar sync
- Drag-and-drop across weeks
- Undo/redo history
- Comment threads
- Hour-slot scheduling

**Critical dependency note:** Print view CSS must be designed in from day one — retrofitting is expensive. Person roster config must exist before color coding can work.

### Architecture Approach

The architecture is a clean separation: one `Y.Doc` initialized at app root, read-only observer components throughout the tree, and a single `EventEditor` component as the sole Yjs writer. This makes debugging and conflict tracing deterministic. No REST API layer exists — PartyKit's Durable Object is the entire backend. All display coordinates (grid slot, column span) are derived at render time from canonical ISO date strings stored in Yjs, never stored in the shared document.

**Major components:**
1. App root — owns the `Y.Doc`, connects to PartyKit on mount, provides Yjs context
2. CalendarGrid / WeekRow / DayCell / EventBlock — read-only Yjs observers; derive layout from canonical dates
3. EventEditor — the sole Yjs writer; handles add/edit/delete with person/color assignment
4. RecurringSection + RecurringEditor — independent Yjs namespace for Ivy's weekly schedule
5. PrintView — read-only observer rendering same Yjs doc for `@media print`

**Data model:** `Y.Doc` contains three named collections — `events: Y.Array<Y.Map>` (canonical fields: id, title, startDate, endDate, personId, time), `persons: Y.Array<Y.Map>`, and `recurring: Y.Array<Y.Map>` (rule-based, not expanded instances).

### Critical Pitfalls

1. **Y.Doc initialized inside a React component** — creates a new document on every render; React 19 Strict Mode doubles this in dev. Initialize at module scope or inside `useRef(() => new Y.Doc())`. Address on day one.

2. **Storing derived display fields in Yjs** — storing `gridRow`, `columnSpan`, or `weekIndex` in `Y.Map` creates stale coordinates and arbitrary CRDT conflicts. Store only canonical data (ISO date strings); derive display coordinates at render time.

3. **Open WebSocket room with no access token** — anyone discovering the URL can delete all events. Embed a hard-to-guess secret token in the shareable URL; validate in PartyKit's `onConnect` handler. Must be done during the initial scaffold — painful to retrofit.

4. **Multi-day event slot allocation without interval scheduling** — naive per-day filtering causes overlapping multi-day events to stack visually on top of each other. Requires a per-week interval-scheduling algorithm (`(events, weekStart) => Map<eventId, slotNumber>`) with unit tests. This is the hardest custom logic in the project.

5. **CSS Grid print layout collapsing or overflowing** — `fr` units don't resolve correctly in print media. Use `repeat(7, 14%)` for print, `break-inside: avoid` on week rows, `@page { size: A4 landscape }`. Test in Chrome, Safari, and Firefox. Design in from the start.

## Implications for Roadmap

All four research files align on the same build order: static grid first, local Yjs state second, PartyKit sync third, polish fourth. The architecture document explicitly states this sequence. The features MVP ordering matches. The pitfalls map directly to each phase.

### Phase 1: Foundation — Grid, Date Utilities, and Yjs Scaffold

**Rationale:** The CSS Grid layout and date arithmetic are the highest-risk custom code. Both must be validated against real data before adding sync complexity. The Yjs schema and security model must also be locked before any data is written — changing the schema or adding token validation after the fact is painful. Mobile touch sizing must be baked in, not retrofitted.

**Delivers:** Renderable calendar grid with hardcoded data, correct date arithmetic with DST-safe utilities, defined Yjs schema, PartyKit server scaffold with token validation, 375px-usable mobile layout.

**Addresses:** 7-column grid layout, week-range headers, today highlight, weekend shading, person color tokens (foundation for all color features).

**Avoids:** Y.Doc in component body (Pitfall 1), derived fields in Yjs (Pitfall 2), open WebSocket room (Pitfall 3), DST off-by-one (Pitfall 11), mobile touch targets too small (Pitfall 8).

### Phase 2: Event Management and Real-Time Sync

**Rationale:** With the grid and schema established, build event CRUD locally first (no network), then swap in the PartyKit provider. This isolates real-time bugs from grid bugs. Multi-day slot allocation belongs here — it depends on the grid being established. Recurring events must use the rule model, not expanded instances. Connection status indicator must be wired when the provider is first connected.

**Delivers:** Full event add/edit/delete with person/color assignment, multi-day spanning with correct slot allocation, real-time sync between family members, persistent storage via IndexedDB, link sharing, recurring schedule section, offline/reconnect status indicator.

**Addresses:** Multi-day event spanning, person color coding, one-tap person assignment, link-based access, persistent storage, inline event editing, recurring schedule section, conflict stacking.

**Avoids:** Multi-day slot collision (Pitfall 4), storing recurring events as instances instead of rules (Pitfall 7), coarse CRDT granularity / JSON string storage (Pitfall 6), no sync feedback (Pitfall 9), holiday data hardcoded in component (Pitfall 12).

### Phase 3: Print View and Visual Polish

**Rationale:** Print is a non-negotiable core requirement but is an isolated CSS concern independent of event logic. It should be built after events work correctly so the rendered output is realistic. Grayscale print fallback (person initials/border patterns) must be designed alongside the color system.

**Delivers:** `@media print` layout for ~10 weeks, grayscale-safe person identification, birthday/anniversary color differentiation, holiday/school vacation shading, print button with correct DOM flush sequencing.

**Addresses:** Print view (~10 weeks), weekend/holiday shading, birthday/anniversary color, print button behavior.

**Avoids:** CSS Grid print collapse/overflow (Pitfall 5), grayscale printing losing color coding (Pitfall 10), `window.print()` called before DOM update completes (Pitfall 14).

### Phase 4: Keyboard UX, Configurable Roster, and Hardening

**Rationale:** Quality-of-life features that make the app meaningfully better than the Google Sheet. Configurable person roster depends on the color system being established. Keyboard entry depends on the event editor existing. Yjs GC and missing endDate defaults are defensive measures that round out the app.

**Delivers:** Fast keyboard entry (Tab through slots, keyboard color assignment), configurable person roster (add/remove family members), week-range headers, event endDate defaulting correctly, Yjs GC confirmed enabled.

**Addresses:** Fast keyboard entry (differentiator), configurable person roster (required for color coding to be user-configurable), event times (optional).

**Avoids:** Missing endDate handling (Pitfall 15), Yjs document growing unbounded (Pitfall 13).

### Phase Ordering Rationale

- Grid and date math are validated with hardcoded data before sync complexity is added — this isolates two independent hard problems.
- Yjs schema and security are locked in Phase 1 because changing them after data is live is expensive.
- Local Yjs CRDT (Phase 2 first half) is validated before PartyKit sync (Phase 2 second half) — network bugs are separated from rendering bugs.
- Print view (Phase 3) is isolated because it's a pure CSS concern; it reads the same Yjs doc with no new data model work.
- Keyboard UX and roster config (Phase 4) are independent of everything else and add the most polish-to-complexity value.

### Research Flags

Phases needing deeper research during planning:
- **Phase 1 (slot allocation algorithm design):** The interval-scheduling algorithm for multi-day event slot reservation is non-trivial. Plan dedicated design time and write unit tests against known inputs before integrating into the grid renderer.
- **Phase 1 (PartyKit token validation pattern):** Confirm the exact `onBeforeConnect` / `onConnect` API for embedding a secret token in the room name and validating it server-side.

Phases with standard patterns (can skip research-phase):
- **Phase 3 (Print CSS):** The patterns are well-documented: percentage columns, `break-inside: avoid`, `@page` sizing, Tailwind `print:` variant. No research needed — just implement and test in three browsers.
- **Phase 4 (Keyboard UX):** Standard React event handling with `tabIndex`, `onKeyDown`, and `focus` management. Well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies (React, Vite, Yjs, Tailwind v4) sourced from official docs and release notes. PartyKit/Cloudflare acquisition confirmed via official blog. y-partykit provider confirmed in official PartyKit docs. |
| Features | HIGH | Derived directly from stated project requirements (Google Sheets replacement, fridge print, family color coding, Ivy's dance schedule). No ambiguity in user need. |
| Architecture | HIGH | Based on official Yjs docs, PartyKit/Cloudflare docs, MDN CSS Grid spec, and React documentation. Single Y.Doc pattern and EventEditor-as-sole-writer are standard Yjs best practices. |
| Pitfalls | HIGH (patterns), MEDIUM (Yjs edge cases) | CSS Grid, print CSS, and CRDT patterns are well-documented. Specific Yjs + React lifecycle edge cases and PartyKit-specific behavior have MEDIUM confidence due to PartyKit's relatively recent Cloudflare acquisition and evolving docs. |

**Overall confidence:** HIGH

### Gaps to Address

- **Holiday data source:** Research flagged the decision between a hardcoded US holiday list and a school district API as unresolved. For v1, recommend a hardcoded JSON file in the Yjs shared document — simple, editable, no external dependency. Validate this with the user during requirements definition.
- **Temporal API (future):** date-fns v4 is correct for now. Revisit the native Temporal API in ~12 months when Safari/Firefox support stabilizes. No action needed during this project.
- **Offline-first depth:** The stack supports offline-first via `y-indexeddb` alongside `y-partykit` with no architecture changes. Whether this is a v1 requirement needs confirmation during requirements definition.
- **y-partykit 0.0.x stability:** The `0.0.x` version semver signals the package is pre-stable. Verify the current published version and changelog before Phase 2 implementation to confirm no breaking API changes since research.

## Sources

### Primary (HIGH confidence)
- [Cloudflare acquires PartyKit](https://blog.cloudflare.com/cloudflare-acquires-partykit/) — PartyKit status, Cloudflare Durable Objects backend
- [Y-PartyKit API docs](https://docs.partykit.io/reference/y-partykit-api/) — `useYProvider` hook, WebSocket provider integration
- [Yjs docs](https://docs.yjs.dev/) — CRDT model, `Y.Doc` lifecycle, provider ecosystem, GC behavior
- [shadcn/ui Vite installation](https://ui.shadcn.com/docs/installation/vite) — Tailwind v4 + shadcn/ui setup
- [date-fns npm](https://www.npmjs.com/package/date-fns) — v4 TypeScript support, tree-shaking
- [React v19 release](https://react.dev/blog/2024/12/05/react-19) — React 19 concurrent rendering, Strict Mode behavior
- [Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) — free tier confirmation
- [Chrome 144 Temporal API](https://www.infoq.com/news/2026/02/chrome-temporal-date-api/) — Temporal browser support status
- [Vercel WebSocket limitation](https://community.vercel.com/t/feature-request-native-websocket-support-for-next-js-applications-on-vercel/32017) — confirmed Vercel cannot hold WebSocket connections

### Secondary (MEDIUM confidence)
- [Vite vs Next.js: Choosing the Right Tool in 2026](https://dev.to/shadcndeck_dev/nextjs-vs-vite-choosing-the-right-tool-in-2026-38hp) — SPA recommendation over Next.js for this use case
- [Tailwind CSS v4 Complete Guide](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide) — v4 Vite plugin and CSS-first config
- [Zustand + TanStack Query patterns](https://javascript.plainenglish.io/zustand-and-tanstack-query-the-dynamic-duo-that-simplified-my-react-state-management-e71b924efb90) — Zustand for UI state alongside Yjs for shared state

---
*Research completed: 2026-03-10*
*Ready for roadmap: yes*
