import { useState } from 'react'
import { PEOPLE } from '../lib/people'
import { getPeople, addPerson, removePerson, useRosterMap } from '../lib/eventStore'

interface SettingsPanelProps {
  onClose: () => void
}

// All available color tokens (from Tailwind v4 @theme in index.css)
const COLOR_TOKENS = [
  'timur',
  'lois',
  'joy',
  'ivy',
  'both-girls',
  'whole-family',
  'other',
  'unassigned',
] as const

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  // Subscribe to rosterMap so the panel re-renders on any roster change
  useRosterMap()

  const people = getPeople()

  const [name, setName] = useState('')
  const [selectedToken, setSelectedToken] = useState<string>(COLOR_TOKENS[7]) // default: unassigned

  const isDefault = (id: string) => PEOPLE.some(p => p.id === id)

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addPerson({
      id: crypto.randomUUID().slice(0, 8),
      label: trimmed,
      colorToken: selectedToken,
    })
    setName('')
    setSelectedToken(COLOR_TOKENS[7])
  }

  return (
    <div className="fixed inset-y-0 right-0 w-72 bg-white shadow-xl z-30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">Family Members</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          aria-label="Close settings"
        >
          ×
        </button>
      </div>

      {/* People list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {people.map(person => (
          <div key={person.id} className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: `var(--color-${person.colorToken})` }}
            />
            <span className="flex-1 text-sm text-gray-700">{person.label}</span>
            {!isDefault(person.id) && (
              <button
                type="button"
                onClick={() => removePerson(person.id)}
                className="text-gray-400 hover:text-red-500 text-lg leading-none"
                aria-label={`Remove ${person.label}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add person form */}
      <div className="border-t border-gray-200 px-4 py-3 space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Add person</p>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          placeholder="Name"
          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        {/* Color picker */}
        <div className="flex flex-wrap gap-1">
          {COLOR_TOKENS.map(token => (
            <button
              key={token}
              type="button"
              onClick={() => setSelectedToken(token)}
              aria-label={`Select color ${token}`}
              className={`w-6 h-6 rounded-full border-2 ${
                selectedToken === token ? 'border-gray-700' : 'border-transparent'
              }`}
              style={{ backgroundColor: `var(--color-${token})` }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!name.trim()}
          className="w-full text-sm bg-gray-800 text-white rounded px-3 py-1.5 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  )
}
