---
phase: 01-grid-scaffold
plan: 03
subsystem: infra
tags: [yjs, partykit, crdt, websocket, cloudflare, token-auth]

# Dependency graph
requires:
  - phase: 01-grid-scaffold plan 01
    provides: Vite + React project scaffold, tsconfig, dev environment
  - phase: 01-grid-scaffold plan 02
    provides: src/lib/token.ts (getTokenFromURL), date utilities, component stubs

provides:
  - Module-scope Y.Doc singleton and eventsMap (src/lib/ydoc.ts)
  - YPartyKitProvider wrapping App root with async token params (src/App.tsx)
  - PartyKit server with fail-closed token auth and Yjs snapshot persistence (party/server.ts)

affects:
  - 01-grid-scaffold (plan 04 — CalendarGrid wires into App)
  - Phase 2 (Events and Sync — all Yjs writes use eventsMap from this plan)

# Tech tracking
tech-stack:
  added: []  # yjs and y-partykit were installed in plan 01
  patterns:
    - Module-scope Y.Doc singleton (never inside React component or hook)
    - Module-scope YPartyKitProvider (stable across StrictMode double-invoke)
    - PartyKit onBeforeConnect for edge-side token validation before WebSocket upgrade
    - Fail-closed token guard (rejects all connections when SECRET_TOKEN is empty)
    - y-partykit onConnect with persist: snapshot for new-client document hydration

key-files:
  created:
    - src/lib/ydoc.ts
    - party/server.ts
  modified:
    - src/App.tsx

key-decisions:
  - "Y.Doc and YPartyKitProvider created at module scope, not inside React — prevents StrictMode double-invoke creating duplicate documents"
  - "onBeforeConnect rejects when SECRET_TOKEN is empty string — fail-closed protects misconfigured deployments"
  - "eventsMap keys are ISO date strings — schema established before Phase 2 writes to prevent migration cost"
  - "No onMessage or onClose handlers in Phase 1 — y-partykit onConnect handles all Yjs protocol internally"

patterns-established:
  - "Module-scope singletons: Y.Doc and provider are created before React, preventing double-init bugs"
  - "Fail-closed auth: any misconfiguration (missing env var) results in denied access, not open access"
  - "Canonical data only in Yjs: ISO date keys and personId — display coordinates derived at render time"

requirements-completed: [SHRG-01]

# Metrics
duration: ~10min
completed: 2026-03-10
---

# Phase 01 Plan 03: Yjs/PartyKit Sync Foundation Summary

**Module-scope Y.Doc singleton with ISO-date-keyed eventsMap, YPartyKitProvider in App root, and PartyKit server with fail-closed token auth and Yjs snapshot persistence**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-10
- **Completed:** 2026-03-10
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created src/lib/ydoc.ts exporting a module-scope Y.Doc and eventsMap keyed by ISO date strings, establishing the canonical data schema for Phase 2
- Updated src/App.tsx to create YPartyKitProvider at module scope with async token params, wrapping the CalendarGrid placeholder
- Created party/server.ts implementing PartyKit's Party.Server with fail-closed onBeforeConnect token validation and y-partykit Yjs sync with snapshot persistence

## Task Commits

1. **Task 1: Yjs document singleton and App provider wrapper** - `d78c454` (feat)
2. **Task 2: PartyKit server with token auth and Yjs sync** - `93f7194` (feat)

## Files Created/Modified

- `src/lib/ydoc.ts` - Module-scope Y.Doc singleton and eventsMap (ISO date keyed Y.Map)
- `src/App.tsx` - App root with module-scope YPartyKitProvider and token integration
- `party/server.ts` - CalendarServer with static onBeforeConnect token guard and y-partykit onConnect

## Decisions Made

- Y.Doc and YPartyKitProvider placed at module scope rather than inside a React component or hook — React StrictMode double-invokes component functions in development, which would create two Y.Doc instances and corrupt sync state
- Fail-closed guard: `!SECRET_TOKEN || !token || token !== SECRET_TOKEN` — if the environment variable is not set in a deployment, all connections are rejected instead of all being allowed
- eventsMap schema (ISO date string keys, Y.Array<Y.Map<unknown>> values) locked in before Phase 2 writes any event data, preventing a migration cost later
- `_provider` prefix on the module-scope variable signals intentional side effect without triggering TypeScript unused-variable warnings

## Deviations from Plan

None - plan executed exactly as written. The fail-closed empty-string guard was explicitly specified in the plan's action block.

## Issues Encountered

None.

## User Setup Required

PartyKit token configuration is required before deploying. Add `CALENDAR_TOKEN=<your-secret>` to the PartyKit deploy environment (partykit.json or dashboard) and embed the same value in the shared URL as `?token=<your-secret>`. For local dev, create a `.env` file at project root with `CALENDAR_TOKEN=your-secret-here`.

## Next Phase Readiness

- Yjs sync foundation complete — Phase 2 can write event data to eventsMap immediately
- CalendarGrid placeholder in App.tsx is ready for Plan 04 to wire in the real grid component
- party/server.ts is ready for `npx partykit dev` local testing once CALENDAR_TOKEN env var is set
- Blocker to note: verify y-partykit 0.0.33 changelog before Phase 2 (pre-stable semver)

---
*Phase: 01-grid-scaffold*
*Completed: 2026-03-10*
