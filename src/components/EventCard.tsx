export interface EventCardProps {
  title: string
  colorToken: string | null
  startTime?: string
  isMultiDay?: boolean
  onEdit: () => void
}

export function EventCard({ title, colorToken, startTime, onEdit }: EventCardProps) {
  return (
    <button
      type="button"
      className={`bg-${colorToken ?? 'unassigned'} flex flex-row items-center gap-0.5 w-full h-6 rounded-sm px-1 text-xs overflow-hidden text-left`}
      onClick={onEdit}
    >
      <span className="truncate">{title}</span>
      {startTime && <span className="text-[10px] opacity-70">{startTime}</span>}
    </button>
  )
}
