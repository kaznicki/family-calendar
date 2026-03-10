import { describe, it } from 'vitest'
// generateWeeks and formatWeekRange don't exist yet — Plan 02 implements them
// These stubs define the expected contract before implementation

describe('generateWeeks', () => {
  it.todo('returns ~104 weeks for a 24-month range (6 months back + 18 months forward)')
  it.todo('first week starts on a Sunday')
  it.todo('each week object has weekStart, weekEnd, days (length 7), and label')
  it.todo("today's date falls within the generated range")
})

describe('formatWeekRange', () => {
  it.todo('formats same-month range as "May 11–17"')
  it.todo('formats cross-month range as "May 28–Jun 3"')
})
