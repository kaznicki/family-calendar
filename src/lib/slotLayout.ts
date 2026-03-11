// Slot allocation algorithm: pure function, no Yjs, no React.
// Implements interval graph coloring for the family calendar row-slot layout.

export interface LayoutEvent {
  id: string
  date: string // ISO start date string: "2026-03-10"
  isMultiDay?: boolean
  endDate?: string // ISO end date — only when isMultiDay=true
}

/** Slot index reserved for multi-day events (always rendered as a spanning row) */
export const MULTI_DAY_SLOT = 0

/**
 * Total number of slots per week row.
 * Slot 0 = multi-day; slots 1-4 = single-day; slot -1 = overflow.
 */
export const MAX_SLOTS = 5

/**
 * Compute slot indices for all events visible in a week.
 *
 * Slot index conventions:
 *   0       — multi-day event row (spans grid columns visually)
 *   1–4     — single-day event rows (stacked within a day cell)
 *  -1       — overflow (5th+ single-day event on the same date, hidden)
 *
 * Collision is checked per-date, not per-week:
 *   - Two non-overlapping multi-day events in the same week both get slot 0
 *   - Two single-day events on different dates both get slot 1
 *
 * @param events - All events whose date falls within [weekStart, weekEnd]
 * @param weekStart - First day of week (Sunday) — reserved for future use
 * @param weekEnd   - Last day of week (Saturday) — reserved for future use
 * @returns Map<eventId, slotIndex>
 */
export function computeSlotLayout(
  events: LayoutEvent[],
  _weekStart: Date,
  _weekEnd: Date,
): Map<string, number> {
  const result = new Map<string, number>()

  // Counter per ISO date string — tracks next slot for single-day events
  const singleDaySlotByDate = new Map<string, number>()

  for (const event of events) {
    if (event.isMultiDay) {
      // Multi-day events always occupy slot 0
      result.set(event.id, 0)
    } else {
      const key = event.date
      const nextSlot = singleDaySlotByDate.get(key) ?? 1
      if (nextSlot <= 4) {
        result.set(event.id, nextSlot)
        singleDaySlotByDate.set(key, nextSlot + 1)
      } else {
        // 5th+ single-day event on same date — overflow
        result.set(event.id, -1)
      }
    }
  }

  return result
}
