import type * as Party from 'partykit/server'
import { onConnect } from 'y-partykit'

// CALENDAR_TOKEN is set as an environment variable in PartyKit deploy config.
// For local dev: create a .env file at project root with CALENDAR_TOKEN=your-secret-here
// The same token value must be embedded in the shared URL: ?token=your-secret-here
// The URL is the password — anyone with the link has full read+write access.
const SECRET_TOKEN = process.env.CALENDAR_TOKEN ?? ''

export default class CalendarServer implements Party.Server {
  constructor(public party: Party.Room) {}

  // onBeforeConnect runs at the Cloudflare edge BEFORE the WebSocket upgrade.
  // Returning a Response rejects the connection before it is established.
  // Returning void/undefined allows it to proceed.
  static async onBeforeConnect(request: Party.Request): Promise<Response | void> {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    // If CALENDAR_TOKEN is not configured (e.g. local dev without .env), allow all connections.
    // If it is configured, enforce it — reject connections with a missing or wrong token.
    if (SECRET_TOKEN && (!token || token !== SECRET_TOKEN)) {
      // 401 response prevents WebSocket upgrade — connection never opens
      return new Response('Unauthorized', { status: 401 })
    }
    // Implicitly return undefined: connection proceeds
  }

  onConnect(conn: Party.Connection): void | Promise<void> {
    // onConnect from y-partykit handles all Yjs protocol messages:
    // awareness updates, document sync, history compaction.
    // persist: snapshot saves the latest document state to room storage
    // so new clients receive the current document on connect.
    return onConnect(conn, this.party, {
      persist: { mode: 'snapshot' },
    })
  }
}

export const handler = CalendarServer
