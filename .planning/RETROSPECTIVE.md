# Project Retrospective: Family Calendar

---

## Milestone: v1.0 — Core Calendar

**Shipped:** 2026-03-12
**Phases:** 3 | **Plans:** 19

### What Was Built
- Project scaffold: Vite 6, React 19, TypeScript, Tailwind v4, Vitest 4 — full CI from day 1
- Date math library and calendar grid: 7-column weekly view, scroll-to-today, weekend/today highlighting
- Yjs CRDT + PartyKit backend: token-protected room, real-time sync without last-write-wins conflicts
- Event CRUD: inline add/edit/delete, person color coding, multi-day drag-select spanning
- Recurring footer: 7×7 grid reference panel for standing weekly schedule, Yjs-backed
- Settings panel: roster management (add/remove custom people, color assignment)
- Holiday/vacation shading, birthday/anniversary special color, print view (~10 weeks)

### What Worked
- TDD-first approach — writing failing tests before implementation caught prop shape mismatches early, especially in slotLayout.ts
- Parallel plan execution within waves — 2–3 independent plans ran simultaneously without git conflicts because file sets were cleanly separated
- Yjs CRDT choice — eliminated all merge conflict scenarios; no special sync logic needed
- PartyKit on Cloudflare Workers — WebSocket persistence worked out of the box; Vercel would have failed here

### What Was Inefficient
- Phase 2 wave structure was dense (9 plans) — some plans were small enough to merge; the stub-first Wave 0 approach added overhead for straightforward component plans
- Print CSS required a second pass — `fr` units don't work in @media print; should have used `%` from the start

### Patterns Established
- Y.Doc at module scope (NOT inside React component) — StrictMode would remount and lose data otherwise
- Store only canonical data in Yjs (ISO dates, personId) — derive display coords at render time
- Never use dynamic `bg-${token}` Tailwind classes — Tailwind v4 purges these; use `style={{ backgroundColor: \`var(--color-${token})\` }}`
- `alignSelf: start` on sticky header div — prevents CSS Grid stretch from breaking `position: sticky`
- `position: fixed` + `pb-28` for RecurringFooter — prevents content from hiding under fixed footer

### Key Lessons
- CRDT is the right default for multi-user local state — the complexity cost is paid once in the data model, not repeatedly in conflict handlers
- Tailwind v4's CSS-first config is genuinely better but has gotchas (no config file, dynamic class purging) — document constraints early
- Print is a separate rendering problem — test it in Wave 0 of any print phase, not at the end

### Cost Observations
- Model mix: 100% Sonnet (balanced profile)
- Sessions: ~3 sessions over 2 days (2026-03-10 → 2026-03-12)
- Notable: 5 phases, 19 plans, 114 commits total across v1.0+v1.1

---

## Milestone: v1.1 — Visual Polish and UX Fixes

**Shipped:** 2026-03-13
**Phases:** 2 (Phases 4–5) | **Plans:** 6

### What Was Built
- **Phase 4 — Layout Fixes:**
  - Interval-graph coloring algorithm in `slotLayout.ts` — replaced slot-0 spanning row model; multi-day events now occupy consistent real slots 1–4
  - Removed `MULTI_DAY_SLOT` concept entirely; `WeekRow` no longer renders a separate multi-day row
  - Sticky day-name header moved inside scroll container — eliminated scrollbar-induced column drift
- **Phase 5 — Visual and Copy Polish:**
  - All date numbers bold (`font-bold`); today gets `rounded-full bg-blue-600 text-white` 20px circular badge
  - Week range label: `text-[10px] text-gray-400` → `text-sm font-semibold text-gray-700`
  - RecurringFooter day headers: `text-[10px] text-gray-400` → `text-xs font-semibold text-gray-600`
  - SettingsPanel section label: `text-gray-500` → `text-gray-700`; "Add person" → "Add Person or Group"

### What Worked
- Research phase caught the correct scope for STNG-01 before execution — action buttons already had good contrast; only the section label paragraph needed fixing. Saved a round-trip
- All 6 plans were autonomous with no checkpoints — v1.1 had zero human-action gates during execution
- Wave 1 all-parallel execution (3 agents simultaneous) completed in ~5 minutes

### What Was Inefficient
- LAYT-02 checkbox in REQUIREMENTS.md wasn't ticked after Phase 4 completed — `roadmap update-plan-progress` missed it. Required manual fix at milestone close
- STATE.md status field was stale after Phase 4 ("awaiting plan-phase 4" when Phase 4 was already done) — resumption at start of v1.1 work caught it but STATE.md tracking of sub-phase progress needs attention

### Patterns Established
- Interval-graph slot coloring: sort events by start date + duration descending, greedily assign first non-overlapping slot 1–4
- Pass full `weekEvents` to DayColumn (not `allEvents[isoDate]`) — multi-day events are keyed by start date only
- `bg-blue-600` is safe as a static class (standard Tailwind palette); the dynamic-class constraint only applies to project person color tokens in `@theme {}`
- Sticky header inside scroll container: when header grid and content grid must align precisely, nest the sticky header inside the `overflow-y-auto` element

### Key Lessons
- Small polish milestones execute very fast when research is thorough — 6 plans, 1 session
- TDD for CSS class assertions is a good proxy for visual requirements that can't be fully automated; pair with 4 manual spot-checks at verification

### Cost Observations
- Model mix: 100% Sonnet
- Sessions: 1 session (2026-03-13)
- Notable: 6 plans, ~14 tasks, 27 files changed, 2,530 insertions

---

## Cross-Milestone Trends

| Metric | v1.0 | v1.1 |
|--------|------|------|
| Phases | 3 | 2 |
| Plans | 19 | 6 |
| Timeline | 2 days | 1 day |
| Test count at close | ~159 | 173 |
| Autonomous plans | ~85% | 100% |
| Human checkpoints | 2 (verify passes) | 0 |
| Gaps found at verify | 0 | 0 |

**Trend:** Execution is accelerating. v1.1 had zero rework, zero gaps at verification, and zero human checkpoints during plan execution.
