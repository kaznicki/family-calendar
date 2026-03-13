import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'

// Single Y.Doc for the entire app — created once at module load, before React runs.
// DO NOT move this into a component, hook, or useMemo — StrictMode double-invoke
// would create two documents and break sync state.
export const ydoc = new Y.Doc()

// Persist the Y.Doc to IndexedDB so data survives page reloads without a server.
// The name 'family-calendar-v1' is the IndexedDB database name — changing it clears
// all locally stored data, so only change it if a fresh start is intentional.
export const indexeddbProvider = new IndexeddbPersistence('family-calendar-v1', ydoc)

// Calendar events map: keys are ISO date strings ("2026-03-10")
// Values are Y.Array<Y.Map<unknown>> — one entry per event on that date.
// Display coordinates (grid row/column) are NEVER stored here; they are
// derived at render time in Phase 2.
export const eventsMap = ydoc.getMap<Y.Array<Y.Map<unknown>>>('events')

// Recurring schedule map: keys are "{personId}-{dayOfWeek}" (e.g. "timur-1")
// Value is an activity label string (e.g. "Capital Planning")
// Day of week: 0=Sun, 1=Mon, ..., 6=Sat
// Delete key to remove entry — no null values stored
export const recurringMap = ydoc.getMap<string>('recurring')

// Roster map: keys are personId strings (e.g. "timur", "custom-alice")
// Value is JSON string: { label: string; colorToken: string }
// The 7 default people from people.ts are static — rosterMap only stores additions
export const rosterMap = ydoc.getMap<string>('roster')

// Holidays map: keys are ISO date strings ("2026-03-17"), value is boolean true.
// A key's presence marks the day as a holiday/vacation; absence = not a holiday.
export const holidaysMap = ydoc.getMap<boolean>('holidays')

// Birthdays map: keys are person id strings, value is JSON string of BirthdayEntry.
// Stores recurring birthday/anniversary entries that highlight a day each year.
export const birthdaysMap = ydoc.getMap<string>('birthdays')
