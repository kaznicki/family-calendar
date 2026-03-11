import { useSyncExternalStore } from 'react'
import * as Y from 'yjs'
import { eventsMap as moduleEventsMap, recurringMap, rosterMap as moduleRosterMap, ydoc } from './ydoc'
import { PEOPLE, type CalendarEvent, type Person } from './people'

// ─── Snapshot cache (module scope — never inside hook) ────────────────────────
// Caching at module scope ensures stable reference identity between renders
// when data has not changed. This is required by useSyncExternalStore.

let cachedEventsSnapshot: Record<string, unknown[]> = {}
let cachedRecurringSnapshot: Record<string, string> = {}

// ─── useEventsMap ─────────────────────────────────────────────────────────────

const eventsSubscribe = (cb: () => void) => {
  moduleEventsMap.observeDeep(cb)
  return () => moduleEventsMap.unobserveDeep(cb)
}

const eventsGetSnapshot = (): Record<string, unknown[]> => {
  const fresh = JSON.stringify(moduleEventsMap.toJSON())
  const cached = JSON.stringify(cachedEventsSnapshot)
  if (fresh !== cached) cachedEventsSnapshot = JSON.parse(fresh)
  return cachedEventsSnapshot
}

export const useEventsMap = () => useSyncExternalStore(eventsSubscribe, eventsGetSnapshot)

// ─── useRecurringMap ──────────────────────────────────────────────────────────

const recurringSubscribe = (cb: () => void) => {
  recurringMap.observeDeep(cb)
  return () => recurringMap.unobserveDeep(cb)
}

const recurringGetSnapshot = (): Record<string, string> => {
  const fresh = JSON.stringify(recurringMap.toJSON())
  const cached = JSON.stringify(cachedRecurringSnapshot)
  if (fresh !== cached) cachedRecurringSnapshot = JSON.parse(fresh)
  return cachedRecurringSnapshot
}

export const useRecurringMap = () => useSyncExternalStore(recurringSubscribe, recurringGetSnapshot)

// ─── addEvent ─────────────────────────────────────────────────────────────────

export function addEvent(
  event: CalendarEvent,
  map: Y.Map<Y.Array<Y.Map<unknown>>> = moduleEventsMap,
  doc: Y.Doc = ydoc,
): void {
  doc.transact(() => {
    if (!map.has(event.date)) {
      map.set(event.date, new Y.Array<Y.Map<unknown>>())
    }
    const arr = map.get(event.date)!
    const entry = new Y.Map<unknown>()
    entry.set('id', event.id)
    entry.set('title', event.title)
    entry.set('date', event.date)
    entry.set('personId', event.personId)
    entry.set('color', event.color)
    if (event.startTime !== undefined) entry.set('startTime', event.startTime)
    if (event.isMultiDay !== undefined) entry.set('isMultiDay', event.isMultiDay)
    if (event.endDate !== undefined) entry.set('endDate', event.endDate)
    arr.push([entry])
  })
}

// ─── deleteEvent ──────────────────────────────────────────────────────────────

export function deleteEvent(
  dateKey: string,
  eventId: string,
  map: Y.Map<Y.Array<Y.Map<unknown>>> = moduleEventsMap,
  doc: Y.Doc = ydoc,
): void {
  if (!map.has(dateKey)) return
  const arr = map.get(dateKey)!
  doc.transact(() => {
    const idx = arr.toArray().findIndex(e => e.get('id') === eventId)
    if (idx !== -1) arr.delete(idx, 1)
  })
}

// ─── Roster helpers ───────────────────────────────────────────────────────────

export function addPerson(
  person: Person,
  map: Y.Map<string> = moduleRosterMap,
  doc: Y.Doc = ydoc,
): void {
  doc.transact(() => {
    map.set(person.id, JSON.stringify({ label: person.label, colorToken: person.colorToken }))
  })
}

export function removePerson(
  personId: string,
  map: Y.Map<string> = moduleRosterMap,
  doc: Y.Doc = ydoc,
): void {
  doc.transact(() => {
    map.delete(personId)
  })
}

export function getPeople(map: Y.Map<string> = moduleRosterMap): Person[] {
  const custom: Person[] = []
  map.forEach((value, id) => {
    const parsed = JSON.parse(value) as { label: string; colorToken: string }
    custom.push({ id, label: parsed.label, colorToken: parsed.colorToken })
  })
  return [...PEOPLE, ...custom]
}
