// Single empty event slot — Phase 1: invisible placeholder (no border, no affordance)
// Phase 2 will add click handler and event content here.
// Fixed height ensures consistent row geometry across all day columns.
export function EventSlot() {
  return (
    <div
      role="gridcell"
      data-testid="event-slot"
      className="h-7 overflow-hidden"
      // h-7 = 28px per slot; 5 slots = 140px per week row day
      // overflow-hidden clips long event names (Phase 2 will add ellipsis)
    />
  )
}
