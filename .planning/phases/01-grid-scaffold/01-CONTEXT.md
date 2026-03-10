# Phase 1: Grid Scaffold - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a renderable 7-column calendar grid with correct date math, visual markers for today and weekends, Yjs document schema, and secure token-based PartyKit room validation. No event creation or editing — that is Phase 2. This phase produces a working scaffold that a family member can open on any device and see the correctly structured calendar.

</domain>

<decisions>
## Implementation Decisions

### Grid date range & scroll position
- Opens scrolled to today — current week visible near the top on load
- Scrollable range: 6 months back, 18 months forward from today
- No calendar year anchor — continuous time, no "start of year" framing
- Day name headers (Mon–Sun shortened to M T W T F S S on mobile, full names on desktop) are sticky at the top of the viewport
- Week-range headers (e.g. "May 11–17") are visible and scroll with content (not sticky), but remain readable at small text on mobile

### Slot rows per day
- 5 event slot rows per day column, uniform across all 7 days (including weekends)
- Fixed height slots — no dynamic row growth
- Text truncates with ellipsis when the event name is too long
- Tap or click on an event reveals the full text (Phase 2 implementation detail, but slot structure must support it)
- Empty slots in Phase 1 are invisible — just whitespace, no borders or affordance hints
- Print text wrapping is a Phase 3 concern — noted for later

### Today & weekend visual style
- Claude's discretion for all app chrome: today column highlight, weekend shading intensity, overall color palette, typography
- Guidance: clean neutral default — whites, light grays, one accent color for today; nothing that competes with event colors
- Weekend columns (Saturday & Sunday) get a subtle gray background — barely off-white, not dominant

### Mobile layout
- All 7 columns compressed to fit 375px — whole week visible at once (matches the Google Sheet model the family already knows)
- Day names shorten to single letters (M T W T F S S) on mobile
- Week-range header stays visible on mobile at small text
- Tapping empty slots does nothing in Phase 1 — interaction is Phase 2
- No bottom navigation bar in Phase 1

### Person colors (captured for Phase 2)
- 7 event categories, each with a distinct color the family already knows:
  - Timur: salmon/coral (~#E06666)
  - Lois: light pink (~#EA9999)
  - Joy: light green (~#B6D7A8)
  - Ivy: light blue/periwinkle (~#9FC5E8)
  - Both girls: bright cyan (~#00FFFF)
  - Whole Family: bright yellow (~#FFFF00)
  - Other: light peach (~#F9CB9C)
- Exact hex values to be confirmed during Phase 2 planning (approximated from Google Sheets screenshot)

### Claude's Discretion
- Today column highlight treatment (background tint, border style, intensity)
- Exact weekend gray shade
- Overall font, spacing, and border radius choices
- Week-range header font size on mobile

</decisions>

<specifics>
## Specific Ideas

- "Compress all 7 columns" matches the existing Google Sheet model — the family is used to seeing the whole week at once, so don't break that mental model
- Tap/click to reveal full event name mirrors the Google Sheets "wrap text" behavior the family currently uses
- Person colors are intentionally carried over from Google Sheets — family members are attached to their specific colors

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase establishes the foundational patterns

### Integration Points
- Vite 6 + React 19 + TypeScript project scaffold to be created in this phase
- Tailwind v4 for styling (CSS Grid for layout — not FullCalendar or any external calendar lib)
- Y.Doc initialized at module scope (not inside React component) — single document at app root
- PartyKit server on Cloudflare — token embedded in shareable URL, validated in onConnect

</code_context>

<deferred>
## Deferred Ideas

- Print view text wrapping (fixed height + ellipsis on screen; full wrap for print) — Phase 3
- Exact hex values for person colors — confirm during Phase 2 planning
- 'Today' jump button / floating nav — consider adding in Phase 2 when there's content to navigate
- Tap/click-to-expand full event text — Phase 2 (slots must be structurally ready, interaction wired up later)

</deferred>

---

*Phase: 01-grid-scaffold*
*Context gathered: 2026-03-10*
