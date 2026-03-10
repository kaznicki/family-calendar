import * as Y from 'yjs'

// Single Y.Doc for the entire app — created once at module load, before React runs.
// DO NOT move this into a component, hook, or useMemo — StrictMode double-invoke
// would create two documents and break sync state.
export const ydoc = new Y.Doc()

// Calendar events map: keys are ISO date strings ("2026-03-10")
// Values are Y.Array<Y.Map<unknown>> — one entry per event on that date.
// Display coordinates (grid row/column) are NEVER stored here; they are
// derived at render time in Phase 2.
export const eventsMap = ydoc.getMap<Y.Array<Y.Map<unknown>>>('events')
