// Slot allocation algorithm: pure function, no Yjs, no React.
// Implements interval-graph coloring for the family calendar row-slot layout.
// Multi-day events occupy real slots 1–4 (no special slot 0 anymore).

export interface LayoutEvent {
  id: string
  date: string      // ISO start date string: "2026-03-10"
  isMultiDay?: boolean
  endDate?: string  // ISO end date — only when isMultiDay=true
}

/**
 * Maximum real slot index. Slots 1–4 are the visible rows; -1 is overflow.
 */
export const MAX_SLOTS = 4

/**
 * Compute slot indices for all events visible in a week using interval-graph coloring.
 *
 * Slot index conventions:
 *   1–4   — event rows (stacked within a day cell); multi-day events occupy the
 *            same slot number across every date they touch
 *  -1     — overflow (5th+ event on the same date, hidden)
 *
 * Algorithm:
 *   1. Sort events by start date ascending; break ties by duration descending
 *      so longer (multi-day) events claim lower slots first.
 *   2. For each event determine its occupied date range:
 *        single-day:  [date, date]
 *        multi-day:   [date, endDate]
 *   3. Try slots 1–4 in order. A slot is available for the candidate if no
 *      already-assigned event in that slot has an overlapping date range.
 *      Two ranges [a0,a1] and [b0,b1] overlap iff a0 <= b1 AND b0 <= a1
 *      (ISO strings are lexicographically comparable — direct string ≤ is valid).
 *   4. Assign the first available slot; if all four are taken assign -1 (overflow).
 *   5. Return Map<eventId, slotNumber>.
 *
 * @param events    - All events whose date falls within [weekStart, weekEnd]
 * @param weekStart - First day of week (Sunday) — reserved for API compatibility
 * @param weekEnd   - Last day of week (Saturday) — reserved for API compatibility
 * @returns Map<eventId, slotIndex>
 */
export function computeSlotLayout(
  events: LayoutEvent[],
  weekStart: Date,
  weekEnd: Date,
): Map<string, number> {
  // weekStart and weekEnd are kept for API compatibility but unused internally —
  // interval overlap is checked directly via ISO date strings.
  void weekStart
  void weekEnd

  if (events.length === 0) return new Map()

  // Step 1: sort by start date ascending; for equal starts, longer duration first.
  const sorted = [...events].sort((a, b) => {
    if (a.date < b.date) return -1
    if (a.date > b.date) return 1
    // Same start date: longer events (multi-day) first; single-day duration = 0
    const durA = a.endDate ? durationDays(a.date, a.endDate) : 0
    const durB = b.endDate ? durationDays(b.date, b.endDate) : 0
    return durB - durA
  })

  const result = new Map<string, number>()

  // Per-slot, store the list of assigned events (tracked as [start, end] pairs)
  const slotRanges: Array<Array<[string, string]>> = [[], [], [], [], []] // index 1–4

  for (const event of sorted) {
    const start = event.date
    const end = event.isMultiDay && event.endDate ? event.endDate : event.date

    let assigned = false
    for (let slot = 1; slot <= 4; slot++) {
      if (!hasOverlap(slotRanges[slot], start, end)) {
        result.set(event.id, slot)
        slotRanges[slot].push([start, end])
        assigned = true
        break
      }
    }

    if (!assigned) {
      result.set(event.id, -1)
    }
  }

  return result
}

// ── helpers ────────────────────────────────────────────────────────────────

/** Number of calendar days from isoStart to isoEnd (inclusive). */
function durationDays(isoStart: string, isoEnd: string): number {
  // ISO strings are 10 chars: "YYYY-MM-DD". We can compare them lexicographically.
  const msPerDay = 86_400_000
  return (new Date(isoEnd).getTime() - new Date(isoStart).getTime()) / msPerDay
}

/**
 * Returns true if [candidateStart, candidateEnd] overlaps any range in the list.
 * Overlap condition: a0 <= b1 AND b0 <= a1 (touching is also considered overlap).
 */
function hasOverlap(
  ranges: Array<[string, string]>,
  candidateStart: string,
  candidateEnd: string,
): boolean {
  for (const [rangeStart, rangeEnd] of ranges) {
    if (rangeStart <= candidateEnd && candidateStart <= rangeEnd) {
      return true
    }
  }
  return false
}
