import { describe, it, expect, beforeEach } from 'vitest'
import * as Y from 'yjs'
import { useHolidaysMap, useBirthdaysMap, markHoliday, unmarkHoliday, addBirthday, removeBirthday } from './eventStore'
import type { BirthdayEntry } from './dates'

// ─── CRUD helpers for holidays ────────────────────────────────────────────────
// We pass a fresh Y.Doc (and the associated maps) to avoid polluting module-level maps.

describe('markHoliday / unmarkHoliday', () => {
  let doc: Y.Doc
  let hMap: Y.Map<boolean>

  beforeEach(() => {
    doc = new Y.Doc()
    hMap = doc.getMap<boolean>('holidays')
  })

  it('markHoliday sets the isoDate key to true inside a transaction', () => {
    markHoliday('2026-03-17', hMap, doc)
    expect(hMap.get('2026-03-17')).toBe(true)
  })

  it('unmarkHoliday deletes the isoDate key inside a transaction', () => {
    markHoliday('2026-03-17', hMap, doc)
    unmarkHoliday('2026-03-17', hMap, doc)
    expect(hMap.has('2026-03-17')).toBe(false)
  })

  it('unmarkHoliday on a non-existent key is a no-op', () => {
    expect(() => unmarkHoliday('2026-03-17', hMap, doc)).not.toThrow()
  })
})

// ─── CRUD helpers for birthdays ───────────────────────────────────────────────

describe('addBirthday / removeBirthday', () => {
  let doc: Y.Doc
  let bMap: Y.Map<string>

  beforeEach(() => {
    doc = new Y.Doc()
    bMap = doc.getMap<string>('birthdays')
  })

  const entry: BirthdayEntry = { id: 'joy', name: 'Joy', month: 3, day: 17 }

  it('addBirthday stores JSON-stringified BirthdayEntry keyed by id', () => {
    addBirthday(entry, bMap, doc)
    const stored = bMap.get('joy')
    expect(stored).toBeDefined()
    expect(JSON.parse(stored!)).toEqual(entry)
  })

  it('removeBirthday deletes the entry by id', () => {
    addBirthday(entry, bMap, doc)
    removeBirthday('joy', bMap, doc)
    expect(bMap.has('joy')).toBe(false)
  })

  it('removeBirthday on a non-existent id is a no-op', () => {
    expect(() => removeBirthday('nonexistent', bMap, doc)).not.toThrow()
  })
})

// ─── useHolidaysMap / useBirthdaysMap (snapshot stability) ───────────────────
// Note: Testing useSyncExternalStore hooks in isolation requires renderHook.
// The CRUD helpers above exercise the underlying Y.Map integration.
// Full hook integration is covered by eventStore.test.ts pattern.

describe('useBirthdaysMap export exists', () => {
  it('useBirthdaysMap is a function', () => {
    expect(typeof useBirthdaysMap).toBe('function')
  })
})

describe('useHolidaysMap export exists', () => {
  it('useHolidaysMap is a function', () => {
    expect(typeof useHolidaysMap).toBe('function')
  })
})
