interface HolidayMenuProps {
  isHoliday: boolean
  onMark: () => void
  onUnmark: () => void
  onClose: () => void
  anchorPos: { x: number; y: number }
}

export function HolidayMenu({ isHoliday, onMark, onUnmark, onClose, anchorPos }: HolidayMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg py-1 text-sm"
        style={{ top: anchorPos.y, left: anchorPos.x }}
      >
        <button
          type="button"
          className="block w-full text-left px-4 py-1.5 hover:bg-gray-50"
          onClick={() => { isHoliday ? onUnmark() : onMark(); onClose() }}
        >
          {isHoliday ? 'Unmark holiday' : 'Mark as holiday'}
        </button>
      </div>
    </>
  )
}
