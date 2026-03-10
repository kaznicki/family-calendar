import YPartyKitProvider from 'y-partykit/provider'
import { ydoc } from './lib/ydoc'
import { getTokenFromURL } from './lib/token'
import { CalendarGrid } from './components/CalendarGrid'

// PartyKit host: in dev, use localhost:1999; in production, set VITE_PARTYKIT_HOST env var.
const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999'

// Provider created at module scope — not inside the component — so it is stable
// across React re-renders and StrictMode double-invokes.
// Exported so TypeScript does not flag it as an unused local; Phase 2 may use
// provider.awareness for presence/cursors.
export const provider = new YPartyKitProvider(PARTYKIT_HOST, 'family-calendar', ydoc, {
  params: async () => ({ token: getTokenFromURL() }),
})

export default function App() {
  return (
    <div className="font-sans antialiased">
      <CalendarGrid />
    </div>
  )
}
