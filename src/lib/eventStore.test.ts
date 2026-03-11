import { describe, it } from 'vitest'

describe('addEvent', () => {
  it.todo('stores event in eventsMap under the correct ISO date key')
  it.todo('event with startTime includes startTime field in Y.Map')
  it.todo('event without startTime does not set startTime field')
})

describe('deleteEvent', () => {
  it.todo('removes the event with matching id from the date array')
  it.todo('does nothing when date key does not exist')
  it.todo('does nothing when event id not found in array')
})

describe('roster', () => {
  it.todo('addPerson writes JSON to rosterMap under personId key')
  it.todo('removePerson deletes the key from rosterMap')
  it.todo('getPeople merges static PEOPLE with rosterMap additions')
})

describe('concurrent edits (CRDT merge)', () => {
  it.todo('two Y.Doc instances applying each other updates converge to same state')
  it.todo('concurrent add from two clients both survive after merge')
})
