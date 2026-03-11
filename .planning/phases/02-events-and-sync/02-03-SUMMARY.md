---
plan: 02-03
status: complete
---

# Plan 02-03 Summary: Event Store — Yjs Binding + CRUD Helpers

## What Was Built

1. **`useEventsMap` hook** — `useSyncExternalStore` binding to `eventsMap` with module-scope snapshot caching (JSON.stringify comparison). Returns stable reference between renders when data hasn't changed. React 19 concurrent mode safe.

2. **`useRecurringMap` hook** — same pattern wrapping `recurringMap`.

3. **`addEvent(event, map?, doc?)`** — writes a complete Y.Map entry into the date-keyed Y.Array. Optional map/doc args enable test injection.

4. **`deleteEvent(dateKey, eventId, map?, doc?)`** — finds event by ID in the Y.Array and removes it; no-ops on missing date or missing ID.

5. **`addPerson / removePerson / getPeople`** — roster helpers using rosterMap (JSON-encoded values). `getPeople` merges static PEOPLE with rosterMap entries.

## Key Decisions

- All writes wrapped in `doc.transact()` for atomic CRDT operations
- `deleteEvent` finds by `id` field, never caches index
- CRDT concurrent test uses "pre-initialize + sync" pattern: establish shared Y.Array reference before concurrent adds, then cross-apply updates. Y.Array.push() appends are CRDT-safe; competing Y.Map.set(date, newArray) would be LWW.

## Tests

- 11/11 tests passing (TDD RED→GREEN cycle)
- Covers: addEvent, startTime field, no-startTime, deleteEvent (3 cases), roster (3 cases), CRDT merge (2 cases)
- Full suite: 45 passed, 13 todo, 0 failures

## Commits

- `ae16194`: feat(02-03): implement eventStore — useEventsMap hook, CRUD helpers, CRDT merge tests (11/11)

## key-files

### created/modified
- src/lib/eventStore.ts
- src/lib/eventStore.test.ts
