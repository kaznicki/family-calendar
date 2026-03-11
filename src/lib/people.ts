export interface Person {
  id: string // 'timur' | 'lois' | 'joy' | 'ivy' | 'both-girls' | 'whole-family' | 'other'
  label: string
  colorToken: string // Tailwind v4 token name matching @theme entry, e.g. 'timur' -> bg-timur
}

export interface CalendarEvent {
  id: string // crypto.randomUUID()
  title: string
  date: string // ISO date string: "2026-03-15"
  personId: string | null
  color: string | null // colorToken value, redundant but kept for display convenience
  startTime?: string // e.g. "14:30" — optional
  isMultiDay?: boolean
  endDate?: string // ISO date string — only when isMultiDay=true
  // NOTE: rowIndex is intentionally omitted — NEVER stored, always derived
}

export const PEOPLE: Person[] = [
  { id: 'timur',        label: 'Timur',        colorToken: 'timur' },
  { id: 'lois',         label: 'Lois',         colorToken: 'lois' },
  { id: 'joy',          label: 'Joy',          colorToken: 'joy' },
  { id: 'ivy',          label: 'Ivy',          colorToken: 'ivy' },
  { id: 'both-girls',   label: 'Both girls',   colorToken: 'both-girls' },
  { id: 'whole-family', label: 'Whole Family', colorToken: 'whole-family' },
  { id: 'other',        label: 'Other',        colorToken: 'other' },
]
