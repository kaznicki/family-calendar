import { describe, it, expect } from 'vitest'
import { computeSlotLayout } from './slotLayout'

// Week fixture: 2026-03-08 (Sun) to 2026-03-14 (Sat)
const WEEK_START = new Date(2026, 2, 8)  // Sun Mar 8
const WEEK_END   = new Date(2026, 2, 14) // Sat Mar 14

describe('computeSlotLayout', () => {
  // Case 7 — empty input (simplest)
  it('empty events array returns empty Map', () => {
    const result = computeSlotLayout([], WEEK_START, WEEK_END)
    expect(result.size).toBe(0)
  })

  // Case 1 — multi-day always slot 0
  it('multi-day event is always assigned slot 0', () => {
    const events = [
      { id: 'a', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' }, // Mon-Wed
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('a')).toBe(0)
  })

  // Case 2 — single-day fills slots 1-4
  it('single-day events fill slots 1-4 in order', () => {
    const events = [
      { id: 'e1', date: '2026-03-11' },
      { id: 'e2', date: '2026-03-11' },
      { id: 'e3', date: '2026-03-11' },
      { id: 'e4', date: '2026-03-11' },
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('e1')).toBe(1)
    expect(result.get('e2')).toBe(2)
    expect(result.get('e3')).toBe(3)
    expect(result.get('e4')).toBe(4)
  })

  // Case 3 — 5th single-day overflows
  it('5th single-day event on same date is marked overflow (-1)', () => {
    const events = [
      { id: 'e1', date: '2026-03-11' },
      { id: 'e2', date: '2026-03-11' },
      { id: 'e3', date: '2026-03-11' },
      { id: 'e4', date: '2026-03-11' },
      { id: 'e5', date: '2026-03-11' },
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('e1')).toBe(1)
    expect(result.get('e2')).toBe(2)
    expect(result.get('e3')).toBe(3)
    expect(result.get('e4')).toBe(4)
    expect(result.get('e5')).toBe(-1)
  })

  // Case 4 — two non-overlapping multi-day events in the same week
  it('two non-overlapping multi-day events both get slot 0', () => {
    const events = [
      { id: 'a', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-10' }, // Mon-Tue
      { id: 'b', date: '2026-03-12', isMultiDay: true, endDate: '2026-03-13' }, // Thu-Fri
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('a')).toBe(0)
    expect(result.get('b')).toBe(0)
  })

  // Case 5 — mixed multi-day and single-day coexist
  it('mixed multi-day and single-day events coexist without collision', () => {
    const events = [
      { id: 'md', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' }, // Mon-Wed
      { id: 's1', date: '2026-03-09' }, // single-day Mon
      { id: 's2', date: '2026-03-09' }, // single-day Mon
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('md')).toBe(0)
    expect(result.get('s1')).toBe(1)
    expect(result.get('s2')).toBe(2)
  })

  // Case 6 — multi-day clamped to week segment
  it('multi-day event spanning week boundary clamps to weekEnd for CSS span', () => {
    // Event Thu Mar 12 – Tue Mar 17 (crosses Saturday week boundary)
    const events = [
      { id: 'vac', date: '2026-03-12', isMultiDay: true, endDate: '2026-03-17' },
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    // Slot must still be 0 — clamping is a CSS concern, not a slot-index concern
    expect(result.get('vac')).toBe(0)
  })

  // Case 8 — single-day events on different dates do not conflict
  it('single-day events on different dates get the same slot (1) without conflicting', () => {
    const events = [
      { id: 'x', date: '2026-03-10' }, // Tue
      { id: 'y', date: '2026-03-11' }, // Wed
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('x')).toBe(1)
    expect(result.get('y')).toBe(1)
  })
})
