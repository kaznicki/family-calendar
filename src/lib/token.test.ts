import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getTokenFromURL } from './token'

describe('getTokenFromURL', () => {
  const originalLocation = window.location

  beforeEach(() => {
    // jsdom allows reassigning window.location.search via Object.defineProperty
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, search: '' },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    })
  })

  it('reads ?token= query param from window.location.search', () => {
    window.location.search = '?token=abc123secret'
    expect(getTokenFromURL()).toBe('abc123secret')
  })

  it('returns empty string when token param is absent', () => {
    window.location.search = ''
    expect(getTokenFromURL()).toBe('')
  })

  it('returns empty string when search is only other params', () => {
    window.location.search = '?foo=bar'
    expect(getTokenFromURL()).toBe('')
  })
})
