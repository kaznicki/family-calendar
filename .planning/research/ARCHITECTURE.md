# Architecture Research: Family Calendar Web App

## Overview

SPA (Vite + React) + Yjs CRDT sync via PartyKit. No traditional backend, no REST API, no auth system.

## Major Components

### 1. Calendar Grid (Display Layer)
- `CalendarGrid` — root grid container, renders week rows
- `WeekRow` — one week block (7-column, 7-row-slot layout)
- `DayCell` — single day column within a week row
- `EventBlock` — individual event, reads color/person/span from Yjs

All display components are **read-only** — they observe Yjs state and re-render.

### 2. Event Editor (Write Layer)
- `EventEditor` — modal/inline editor for adding/editing events
- `ColorPicker` — person/color selector (one-tap assignment)

**Critical boundary:** `EventEditor` is the **only** component that mutates Yjs shared state. All others are observers.

### 3. Recurring Schedule Section
- `RecurringSection` — displays Ivy's weekly dance schedule
- `RecurringEditor` — edit recurring entries

Independent of main grid — same Yjs doc but separate Y.Map namespace. Can be positioned at bottom or sidebar.

### 4. Print View
- `PrintView` — renders same Yjs doc as grid, optimized for `@media print`
- `PrintButton` — triggers browser print dialog

Read-only. Renders next ~10 weeks. No real-time sync needed during print.

### 5. App Root
- Initializes single `Y.Doc` once at root — never remounted
- Provides Yjs context to all children via React context
- Connects to PartyKit on mount

## Data Flow

```
User action
  → Zustand (local UI state)
  → EventEditor (only writer)
  → Yjs mutation (Y.Array of Y.Map)
  → y-partykit provider
  → PartyKit Durable Object
  → broadcast to all connected clients
  → Yjs observers fire
  → React components re-render
```

## Data Model

```
Y.Doc
├── events: Y.Array<Y.Map>          // all calendar events
│   └── each map: { id, title, date, endDate, personId, time? }
├── persons: Y.Array<Y.Map>         // family member roster
│   └── each map: { id, name, color }
└── recurring: Y.Array<Y.Map>       // Ivy's weekly schedule
    └── each map: { id, title, dayOfWeek, time, personId }
```

## Build Order

1. **Static grid first** — date math and 7-column CSS Grid layout are highest-risk; validate with hardcoded data before any real-time logic
2. **Local Yjs state** — add event CRUD using Yjs locally (no network), prove add/edit/delete flows work
3. **PartyKit sync** — swap in y-partykit provider; Yjs CRDT handles conflict resolution automatically
4. **RecurringSection** — independent; can be built any time after the Yjs model is established
5. **PrintView** — isolated CSS concern; `@media print` + Tailwind `print:` variants

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Yjs CRDT over Firebase/Supabase Realtime | CRDT prevents last-write-wins corruption on concurrent edits |
| Single Y.Doc at root | Avoids multiple sync connections; simpler context model |
| EventEditor as sole Yjs writer | Makes debugging and conflict tracing deterministic |
| Print view reads same Yjs doc | No data duplication; always in sync with live calendar |
| No REST API | PartyKit Durable Object is the backend; eliminates a whole layer |

## Component Boundaries

```
App (Y.Doc owner)
├── CalendarGrid (read-only Yjs observer)
│   └── WeekRow → DayCell → EventBlock
├── EventEditor (sole Yjs writer) [portal/overlay]
├── RecurringSection (read-only Yjs observer)
└── PrintView (read-only Yjs observer, print-only render)
```

## Confidence

HIGH — based on official Yjs docs, PartyKit/Cloudflare docs, MDN CSS Grid spec, and React documentation.

---
*Research completed: 2026-03-10*
