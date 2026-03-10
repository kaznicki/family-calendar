import { describe, it } from 'vitest'
// DayColumn component doesn't exist yet — Plan 04 implements it

describe('DayColumn — today', () => {
  it.todo("sets data-today=\"true\" on today's date column")
  it.todo('does not set data-today on non-today columns')
})

describe('DayColumn — weekend', () => {
  it.todo('Saturday column has weekend background class')
  it.todo('Sunday column has weekend background class')
  it.todo('weekday column does not have weekend background class')
})

describe('DayColumn — slots', () => {
  it.todo('renders exactly 5 event slot children')
})
