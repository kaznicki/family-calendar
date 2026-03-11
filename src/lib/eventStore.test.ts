import * as Y from 'yjs'
import { describe, it, expect, beforeEach } from 'vitest'
import { addEvent, deleteEvent, addPerson, removePerson, getPeople } from './eventStore'
import type { CalendarEvent, Person } from './people'

// Helper: create a fresh in-memory Y.Doc with same structure as ydoc.ts
function makeTestDoc() {
  const doc = new Y.Doc()
  const eventsMap = doc.getMap<Y.Array<Y.Map<unknown>>>('events')
  const rosterMap = doc.getMap<string>('roster')
  return { doc, eventsMap, rosterMap }
}

const baseEvent: CalendarEvent = {
  id: 'evt-1',
  title: 'Doctor appointment',
  date: '2026-03-15',
  personId: 'lois',
  color: 'lois',
}

describe('addEvent', () => {
  it('stores event in eventsMap under the correct ISO date key', () => {
    const { doc, eventsMap } = makeTestDoc()
    addEvent(baseEvent, eventsMap, doc)
    expect(eventsMap.has('2026-03-15')).toBe(true)
    expect(eventsMap.get('2026-03-15')!.length).toBe(1)
    const entry = eventsMap.get('2026-03-15')!.get(0)
    expect(entry.get('id')).toBe('evt-1')
    expect(entry.get('title')).toBe('Doctor appointment')
    expect(entry.get('personId')).toBe('lois')
  })

  it('event with startTime includes startTime field in Y.Map', () => {
    const { doc, eventsMap } = makeTestDoc()
    addEvent({ ...baseEvent, startTime: '14:30' }, eventsMap, doc)
    const entry = eventsMap.get('2026-03-15')!.get(0)
    expect(entry.get('startTime')).toBe('14:30')
  })

  it('event without startTime does not set startTime field', () => {
    const { doc, eventsMap } = makeTestDoc()
    addEvent(baseEvent, eventsMap, doc)
    const entry = eventsMap.get('2026-03-15')!.get(0)
    expect(entry.has('startTime')).toBe(false)
  })
})

describe('deleteEvent', () => {
  it('removes the event with matching id from the date array', () => {
    const { doc, eventsMap } = makeTestDoc()
    addEvent(baseEvent, eventsMap, doc)
    deleteEvent('2026-03-15', 'evt-1', eventsMap, doc)
    expect(eventsMap.get('2026-03-15')!.length).toBe(0)
  })

  it('does nothing when date key does not exist', () => {
    const { doc, eventsMap } = makeTestDoc()
    expect(() => deleteEvent('2026-03-20', 'evt-1', eventsMap, doc)).not.toThrow()
  })

  it('does nothing when event id not found in array', () => {
    const { doc, eventsMap } = makeTestDoc()
    addEvent(baseEvent, eventsMap, doc)
    deleteEvent('2026-03-15', 'wrong-id', eventsMap, doc)
    expect(eventsMap.get('2026-03-15')!.length).toBe(1)
  })
})

describe('roster', () => {
  const alice: Person = { id: 'alice', label: 'Alice', colorToken: 'alice' }

  it('addPerson writes JSON to rosterMap under personId key', () => {
    const { doc, rosterMap } = makeTestDoc()
    addPerson(alice, rosterMap, doc)
    expect(rosterMap.has('alice')).toBe(true)
    const stored = JSON.parse(rosterMap.get('alice')!)
    expect(stored.label).toBe('Alice')
    expect(stored.colorToken).toBe('alice')
  })

  it('removePerson deletes the key from rosterMap', () => {
    const { doc, rosterMap } = makeTestDoc()
    addPerson(alice, rosterMap, doc)
    removePerson('alice', rosterMap, doc)
    expect(rosterMap.has('alice')).toBe(false)
  })

  it('getPeople merges static PEOPLE with rosterMap additions', () => {
    const { doc, rosterMap } = makeTestDoc()
    addPerson(alice, rosterMap, doc)
    const people = getPeople(rosterMap)
    // 7 static + 1 custom
    expect(people.length).toBe(8)
    expect(people.find(p => p.id === 'alice')).toBeDefined()
  })
})

describe('concurrent edits (CRDT merge)', () => {
  // CRDT pattern: establish a shared Y.Array for the date first, then sync
  // to both clients so they reference the SAME array object. Only then can
  // concurrent Y.Array.push() calls from both sides survive the merge.
  // (Y.Map.set() with competing new Y.Array() instances is LWW — one loses.)
  function makeSharedDocs(date: string) {
    const { doc: doc1, eventsMap: map1 } = makeTestDoc()
    // Pre-initialize the date key with a shared Y.Array
    doc1.transact(() => { map1.set(date, new Y.Array()) })
    // Clone state to doc2 so both share the same Y.Array reference
    const { doc: doc2, eventsMap: map2 } = makeTestDoc()
    Y.applyUpdate(doc2, Y.encodeStateAsUpdate(doc1))
    return { doc1, map1, doc2, map2 }
  }

  it('two Y.Doc instances applying each other updates converge to same state', () => {
    const { doc1, map1, doc2, map2 } = makeSharedDocs('2026-03-15')

    addEvent({ ...baseEvent, id: 'evt-A' }, map1, doc1)
    addEvent({ ...baseEvent, id: 'evt-B' }, map2, doc2)

    Y.applyUpdate(doc2, Y.encodeStateAsUpdate(doc1))
    Y.applyUpdate(doc1, Y.encodeStateAsUpdate(doc2))

    expect(map1.get('2026-03-15')!.length).toBe(2)
    expect(map2.get('2026-03-15')!.length).toBe(2)
  })

  it('concurrent add from two clients both survive after merge', () => {
    const { doc1, map1, doc2, map2 } = makeSharedDocs('2026-03-15')

    addEvent({ ...baseEvent, id: 'client1-event' }, map1, doc1)
    addEvent({ ...baseEvent, id: 'client2-event', title: 'Other event' }, map2, doc2)

    Y.applyUpdate(doc1, Y.encodeStateAsUpdate(doc2))
    Y.applyUpdate(doc2, Y.encodeStateAsUpdate(doc1))

    const events1 = map1.get('2026-03-15')!.toArray() as Y.Map<unknown>[]
    const events2 = map2.get('2026-03-15')!.toArray() as Y.Map<unknown>[]
    const ids1 = events1.map(e => e.get('id'))
    const ids2 = events2.map(e => e.get('id'))
    expect(ids1).toContain('client1-event')
    expect(ids1).toContain('client2-event')
    expect(ids2).toContain('client1-event')
    expect(ids2).toContain('client2-event')
  })
})
