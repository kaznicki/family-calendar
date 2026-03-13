import { useState } from 'react'
import YPartyKitProvider from 'y-partykit/provider'
import { ydoc } from './lib/ydoc'
import { getTokenFromURL } from './lib/token'
import { CalendarGrid } from './components/CalendarGrid'
import { SettingsPanel } from './components/SettingsPanel'
import { PrintGrid } from './components/PrintGrid'
import { useEventsMap, useHolidaysMap, useBirthdaysMap } from './lib/eventStore'
import { getPrintWeeks } from './lib/dates'
import type { BirthdayEntry } from './lib/dates'

// PartyKit host: in dev, use localhost:1999; in production, set VITE_PARTYKIT_HOST env var.
const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'family-calendar.kaznicki.partykit.dev'

// Provider created at module scope — not inside the component — so it is stable
// across React re-renders and StrictMode double-invokes.
// Exported so TypeScript does not flag it as an unused local; Phase 2 may use
// provider.awareness for presence/cursors.
export const provider = new YPartyKitProvider(PARTYKIT_HOST, 'family-calendar', ydoc, {
  params: async () => ({ token: getTokenFromURL() }),
})

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  const eventsMap = useEventsMap()
  const holidays = useHolidaysMap()
  const birthdaysRaw = useBirthdaysMap()
  const birthdays: BirthdayEntry[] = Object.values(birthdaysRaw).map(v => JSON.parse(v) as BirthdayEntry)
  const printWeeks = getPrintWeeks()

  return (
    <div className="font-sans antialiased">
      {/* Print button — screen only, left of settings gear */}
      <div className="absolute top-2 right-12 z-20 screen-only">
        <button
          type="button"
          onClick={() => window.print()}
          className="h-8 px-2 flex items-center justify-center rounded bg-white/80 shadow-sm text-gray-500 hover:text-gray-700 text-xs font-medium"
          aria-label="Print calendar"
        >
          Print
        </button>
      </div>

      {/* Settings icon — absolute-positioned so it overlays the CalendarGrid sticky header */}
      {/* without displacing grid layout geometry */}
      <div className="absolute top-2 right-2 z-20 screen-only">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 shadow-sm text-gray-500 hover:text-gray-700"
          aria-label="Open settings"
        >
          ⚙
        </button>
      </div>

      <div className="screen-only">
        <CalendarGrid />
      </div>

      {/* Print-only container — hidden on screen, revealed by @media print */}
      <div className="print-only">
        <PrintGrid
          weeks={printWeeks}
          eventsMap={eventsMap}
          holidays={holidays}
          birthdays={birthdays}
        />
      </div>

      {settingsOpen && (
        <SettingsPanel onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}
