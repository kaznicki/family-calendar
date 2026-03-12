import { useSyncExternalStore } from 'react'
import * as Y from 'yjs'
import { eventsMap as moduleEventsMap, recurringMap, rosterMap as moduleRosterMap, holidaysMap as moduleHolidaysMap, birthdaysMap as moduleBirthdaysMap, ydoc } from './ydoc'
import { PEOPLE, type CalendarEvent, type Person } from './people'
import type { BirthdayEntry } from './dates'

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

// ─── useRosterMap ─────────────────────────────────────────────────────────────

let cachedRosterSnapshot: Record<string, string> = {}

const rosterSubscribe = (cb: () => void) => {
  moduleRosterMap.observeDeep(cb)
  return () => moduleRosterMap.unobserveDeep(cb)
}

const getRosterSnapshot = (): Record<string, string> => {
  const fresh = JSON.stringify(moduleRosterMap.toJSON())
  const cached = JSON.stringify(cachedRosterSnapshot)
  if (fresh !== cached) cachedRosterSnapshot = JSON.parse(fresh)
  return cachedRosterSnapshot
}

export const useRosterMap = () => useSyncExternalStore(rosterSubscribe, getRosterSnapshot)

// ─── useHolidaysMap ───────────────────────────────────────────────────────────

let cachedHolidaysSnapshot: Record<string, boolean> = {}

const holidaysSubscribe = (cb: () => void) => {
  moduleHolidaysMap.observeDeep(cb)
  return () => moduleHolidaysMap.unobserveDeep(cb)
}

const getHolidaysSnapshot = (): Record<string, boolean> => {
  const fresh = JSON.stringify(moduleHolidaysMap.toJSON())
  const cached = JSON.stringify(cachedHolidaysSnapshot)
  if (fresh !== cached) cachedHolidaysSnapshot = JSON.parse(fresh)
  return cachedHolidaysSnapshot
}

export const useHolidaysMap = () => useSyncExternalStore(holidaysSubscribe, getHolidaysSnapshot)

// ─── Holidays CRUD helpers ─────────────────────────────────────────────────────

export function markHoliday(
  isoDate: string,
  map: Y.Map<boolean> = moduleHolidaysMap,
  doc: Y.Doc = ydoc,
): void {
  doc.transact(() => { map.set(isoDate, true) })
}

export function unmarkHoliday(
  isoDate: string,
  map: Y.Map<boolean> = moduleHolidaysMap,
  doc: Y.Doc = ydoc,
): void {
  doc.transact(() => { map.delete(isoDate) })
}

// ─── useBirthdaysMap ──────────────────────────────────────────────────────────

let cachedBirthdaysSnapshot: Record<string, string> = {}

const birthdaysSubscribe = (cb: () => void) => {
  moduleBirthdaysMap.observeDeep(cb)
  return () => moduleBirthdaysMap.unobserveDeep(cb)
}

const getBirthdaysSnapshot = (): Record<string, string> => {
  const fresh = JSON.stringify(moduleBirthdaysMap.toJSON())
  const cached = JSON.stringify(cachedBirthdaysSnapshot)
  if (fresh !== cached) cachedBirthdaysSnapshot = JSON.parse(fresh)
  return cachedBirthdaysSnapshot
}

export const useBirthdaysMap = () => useSyncExternalStore(birthdaysSubscribe, getBirthdaysSnapshot)

// ─── Birthdays CRUD helpers ────────────────────────────────────────────────────

export function addBirthday(
  entry: BirthdayEntry,
  map: Y.Map<string> = moduleBirthdaysMap,
  doc: Y.Doc = ydoc,
): void {
  doc.transact(() => { map.set(entry.id, JSON.stringify(entry)) })
}

export function removeBirthday(
  id: string,
  map: Y.Map<string> = moduleBirthdaysMap,
  doc: Y.Doc = ydoc,
): void {
  doc.transact(() => { map.delete(id) })
}
