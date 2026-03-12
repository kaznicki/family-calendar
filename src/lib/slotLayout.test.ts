import { describe, it, expect } from 'vitest'
import { computeSlotLayout } from './slotLayout'

// Week fixture: 2026-03-08 (Sun) to 2026-03-14 (Sat)
// Mon = 2026-03-09, Tue = 2026-03-10, Wed = 2026-03-11
// Thu = 2026-03-12, Fri = 2026-03-13
const WEEK_START = new Date(2026, 2, 8)  // Sun Mar 8
const WEEK_END   = new Date(2026, 2, 14) // Sat Mar 14

describe('computeSlotLayout — interval-graph coloring (slots 1–4)', () => {
  // Case H: Empty input
  it('H: empty events array returns empty Map', () => {
    const result = computeSlotLayout([], WEEK_START, WEEK_END)
    expect(result.size).toBe(0)
  })

  // Case A: Single multi-day Mon–Wed → slot 1
  it('A: single multi-day event Mon–Wed is assigned slot 1', () => {
    const events = [
      { id: 'a', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('a')).toBe(1)
  })

  // Case B: Two overlapping multi-day events (both Mon–Wed) → slots 1 and 2
  it('B: two overlapping multi-day events get different slots (1 and 2)', () => {
    const events = [
      { id: 'a', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
      { id: 'b', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    const slotA = result.get('a')!
    const slotB = result.get('b')!
    expect(slotA).not.toBe(slotB)
    expect([slotA, slotB].sort()).toEqual([1, 2])
  })

  // Case C: Two non-overlapping multi-day events (Mon–Tue and Thu–Fri) → both slot 1
  it('C: two non-overlapping multi-day events can share slot 1', () => {
    const events = [
      { id: 'a', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-10' }, // Mon–Tue
      { id: 'b', date: '2026-03-12', isMultiDay: true, endDate: '2026-03-13' }, // Thu–Fri
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('a')).toBe(1)
    expect(result.get('b')).toBe(1)
  })

  // Case D: Multi-day Mon–Wed in slot 1; single-day Mon → slot 2 (blocked by multi-day)
  it('D: single-day event on date occupied by multi-day is bumped to slot 2', () => {
    const events = [
      { id: 'md', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' }, // Mon–Wed slot 1
      { id: 's1', date: '2026-03-09' }, // single-day Mon
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('md')).toBe(1)
    expect(result.get('s1')).toBe(2)
  })

  // Case E: Multi-day Mon–Wed in slot 1; single-day Thu (no overlap) → slot 1
  it('E: single-day event on non-overlapping date gets slot 1', () => {
    const events = [
      { id: 'md', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' }, // Mon–Wed slot 1
      { id: 's1', date: '2026-03-12' }, // single-day Thu — no overlap with Mon–Wed
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('md')).toBe(1)
    expect(result.get('s1')).toBe(1)
  })

  // Case F: 4 overlapping multi-day events all spanning the same week → slots 1,2,3,4
  it('F: four overlapping multi-day events fill slots 1–4', () => {
    const events = [
      { id: 'a', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
      { id: 'b', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
      { id: 'c', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
      { id: 'd', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    const slots = [result.get('a')!, result.get('b')!, result.get('c')!, result.get('d')!]
    expect(slots.sort()).toEqual([1, 2, 3, 4])
  })

  // Case G: 5th overlapping event → -1 (overflow)
  it('G: 5th overlapping event on the same date range is overflow (-1)', () => {
    const events = [
      { id: 'a', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
      { id: 'b', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
      { id: 'c', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
      { id: 'd', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
      { id: 'e', date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' },
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    const slots = [
      result.get('a')!,
      result.get('b')!,
      result.get('c')!,
      result.get('d')!,
      result.get('e')!,
    ]
    expect(slots.sort((x, y) => x - y)).toEqual([-1, 1, 2, 3, 4])
  })

  // Case I: Mixed — multi-day Mon–Wed (slot 1), single-day Mon (slot 2), single-day Mon (slot 3), single-day Tue (no conflict with Tue at slot 2)
  it('I: mixed events — multi-day and multiple single-day events resolve correctly', () => {
    const events = [
      { id: 'md',  date: '2026-03-09', isMultiDay: true, endDate: '2026-03-11' }, // Mon–Wed
      { id: 's1',  date: '2026-03-09' }, // single Mon
      { id: 's2',  date: '2026-03-09' }, // single Mon
      { id: 'stu', date: '2026-03-10' }, // single Tue
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    // md occupies slot 1 for Mon–Wed range
    expect(result.get('md')).toBe(1)
    // s1 on Mon — slot 1 blocked by md — gets slot 2
    expect(result.get('s1')).toBe(2)
    // s2 on Mon — slots 1,2 blocked — gets slot 3
    expect(result.get('s2')).toBe(3)
    // stu on Tue — slot 1 blocked by md (Tue is within Mon–Wed), slot 2 free — gets slot 2
    expect(result.get('stu')).toBe(2)
  })

  // Case J: Single single-day event → slot 1 (regression)
  it('J: single single-day event gets slot 1', () => {
    const events = [
      { id: 'x', date: '2026-03-10' },
    ]
    const result = computeSlotLayout(events, WEEK_START, WEEK_END)
    expect(result.get('x')).toBe(1)
  })

  // Case K: 4 single-day events on same date → slots 1,2,3,4 (regression)
  it('K: four single-day events on the same date fill slots 1–4', () => {
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

  // Case L: 5 single-day events on same date → 4 in slots 1–4, 1 overflow (-1) (regression)
  it('L: 5th single-day event on the same date is overflow (-1)', () => {
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

  // Case M: weekStart/weekEnd params accepted (signature preserved)
  it('M: weekStart and weekEnd params are accepted without error', () => {
    const events = [{ id: 'z', date: '2026-03-10' }]
    expect(() => computeSlotLayout(events, WEEK_START, WEEK_END)).not.toThrow()
  })
})
