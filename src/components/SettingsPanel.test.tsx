import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsPanel } from './SettingsPanel'

// Mock eventStore hooks — SettingsPanel calls these at module level
vi.mock('../lib/eventStore', () => ({
  getPeople: () => [],
  addPerson: vi.fn(),
  removePerson: vi.fn(),
  useRosterMap: () => ({}),
  useBirthdaysMap: () => ({}),
  addBirthday: vi.fn(),
  removeBirthday: vi.fn(),
}))

// Mock people — PEOPLE constant used for isDefault check
vi.mock('../lib/people', () => ({
  PEOPLE: [
    { id: 'timur', label: 'Timur', colorToken: 'timur' },
    { id: 'lois', label: 'Lois', colorToken: 'lois' },
  ],
}))

const onClose = vi.fn()

describe('SettingsPanel — STNG-02 label copy', () => {
  it('renders "Add Person or Group" as the section label text', () => {
    render(<SettingsPanel onClose={onClose} />)
    expect(screen.getByText('Add Person or Group')).toBeInTheDocument()
  })
})

describe('SettingsPanel — STNG-01 label contrast', () => {
  it('section label paragraph has class text-gray-700', () => {
    const { container } = render(<SettingsPanel onClose={onClose} />)
    // Find the "Add Person or Group" paragraph by its text content
    const label = screen.getByText('Add Person or Group')
    expect(label.className).toContain('text-gray-700')
  })

  it('section label paragraph does NOT have class text-gray-500', () => {
    render(<SettingsPanel onClose={onClose} />)
    const label = screen.getByText('Add Person or Group')
    expect(label.className).not.toContain('text-gray-500')
  })
})
