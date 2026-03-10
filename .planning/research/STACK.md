# Stack Research

**Domain:** Shared family calendar web app (grid layout, link-based access, real-time collaborative editing)
**Researched:** 2026-03-10
**Confidence:** HIGH (core stack), MEDIUM (real-time sync layer)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.x | UI rendering | Largest ecosystem, concurrent rendering by default in v19, stable Server Components (not needed here but future-proof). Yjs has first-class React bindings. Vite + React is the standard SPA pairing in 2026. |
| Vite | 6.x | Build tool / dev server | Sub-second HMR, esbuild pre-bundling, zero-config TypeScript, produces ~42KB bundles vs Next.js ~92KB. Deployment is a static `dist/` folder — no server, no vendor lock-in. No SSR needed for this app; Next.js adds unnecessary complexity. |
| TypeScript | 5.x | Type safety | Zero-config with Vite's `react-ts` template. Calendar grid logic (date arithmetic, event span calculation) is bug-prone without types. date-fns v3/v4 is 100% TypeScript with handcrafted types. |
| Tailwind CSS | v4.x | Styling | Released January 2025 with CSS-first config, Lightning CSS engine (100x faster incremental builds), native container queries, and cascade layers. Print stylesheets via `@media print` work cleanly. v4 is the current standard for new projects. |
| date-fns | v4.x | Date arithmetic | Pure functional (tree-shakeable), 100% TypeScript, immutable. v4 adds first-class time zone support. Better than Day.js for a custom grid because you control each calculation. Avoid the Temporal API for now — Safari/Firefox support is incomplete as of early 2026 and the polyfill adds bundle weight. |
| Yjs | 13.x | CRDT real-time sync | Conflict-free replicated data structure — multiple family members editing simultaneously cannot corrupt data. No central locking needed. Network-agnostic (works with WebSocket providers). IndexedDB persistence means the calendar survives page reload even offline. |
| y-partykit | 0.0.x | Yjs WebSocket provider | First-party adapter connecting Yjs to PartyKit/Cloudflare. Replaces y-websocket. Supports `useYProvider` React hook. One package handles the provider; the backend is a PartyKit server. |
| PartyKit | 0.0.x | Real-time WebSocket server | Acquired by Cloudflare in 2024; runs on Cloudflare Workers + Durable Objects. No extra PartyKit charges beyond standard Cloudflare Workers usage. Durable Objects with SQLite available on free tier. Eliminates the Vercel WebSocket problem entirely — Vercel serverless functions cannot hold WebSocket connections; PartyKit/Cloudflare can. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.x | Client UI state | Manages ephemeral UI state: which day is selected, which family member color filter is active, print-mode toggle. Lightweight (1KB), no boilerplate, hooks-based. Use alongside Yjs (not instead of it) — Yjs owns shared event data; Zustand owns local UI state. |
| shadcn/ui | latest | Headless accessible components | Copy-paste component library (not a package) built on Radix UI primitives + Tailwind. Use for dialogs (event editor), popovers (color picker), tooltips. You own the code so no library lock-in. The calendar grid itself is custom (not from shadcn). |
| Radix UI | 1.x | Accessible primitives | shadcn/ui pulls this in. Provides keyboard-accessible dialog, popover, focus management — important for a family app used on mobile. |
| lucide-react | 0.x | Icon set | Ships with shadcn/ui setup. SVG icons, tree-shakeable. Use for the print button, add-event, edit, delete icons. |
| clsx + tailwind-merge | latest | Conditional class names | Standard pair for conditional Tailwind classes without style conflicts. Ships with shadcn/ui init. |
| idb | 8.x | IndexedDB wrapper | Yjs's IndexedDB provider (y-indexeddb) handles persistence automatically. Add `idb` only if you need direct DB access beyond what Yjs provides. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite (`react-ts` template) | Project scaffold | `npm create vite@latest family-calendar -- --template react-ts` gives React 19 + TypeScript with no extra config. |
| ESLint + `@typescript-eslint` | Linting | Vite scaffold includes ESLint. Add `eslint-plugin-react-hooks` to catch hook violations. |
| Prettier | Formatting | Add `prettier-plugin-tailwindcss` to auto-sort Tailwind classes. |
| PartyKit CLI | Dev server for real-time | `npx partykit dev` runs a local WebSocket server matching the Cloudflare Durable Objects runtime. |
| Wrangler (Cloudflare) | Deployment | `npx wrangler pages deploy dist` for the SPA; `npx partykit deploy` for the real-time backend. |
| Vitest | Unit testing | Same config as Vite, no extra setup. Use for date arithmetic helpers (week calculation, multi-day span logic, holiday detection). |

---

## Installation

```bash
# Scaffold
npm create vite@latest family-calendar -- --template react-ts
cd family-calendar

# Core runtime
npm install yjs y-partykit zustand date-fns

# UI
npm install tailwindcss @tailwindcss/vite
npm install class-variance-authority clsx tailwind-merge lucide-react

# shadcn/ui (init after Tailwind)
npx shadcn@latest init
# Then add components as needed:
npx shadcn@latest add dialog popover button input

# Dev dependencies
npm install -D vitest @vitest/ui prettier prettier-plugin-tailwindcss

# PartyKit backend (separate directory or monorepo package)
npm create partykit@latest
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vite (SPA) | Next.js 15 App Router | Only if you need SSR for SEO, server actions, or ISR. A family calendar behind a link has no SEO requirement. Next.js + Vercel also cannot hold WebSocket connections without a third-party service. |
| PartyKit + Yjs | Liveblocks | Liveblocks is a managed SaaS — higher cost, proprietary API, no self-hosting. PartyKit is open source and runs on Cloudflare free tier. Liveblocks is better if you need presence cursors, comment threads, and webhooks out of the box with no infrastructure work. |
| PartyKit + Yjs | Hocuspocus (Tiptap) | Hocuspocus requires running your own Node.js server; optimized for rich text editors (Tiptap/ProseMirror). Overkill for a calendar. |
| PartyKit + Yjs | Socket.IO + Postgres | Requires a long-running server (no free tier that holds WebSocket connections + a DB). Operational overhead not justified for a family of 2–4. |
| date-fns | Temporal API (native) | Temporal shipped in Chrome 144 (Feb 2026) but Safari/Firefox support incomplete. The polyfill adds bundle weight. Revisit in 12 months when cross-browser support stabilizes. |
| date-fns | Day.js | Day.js is smaller (6KB) but plugin ecosystem is weaker for calendar arithmetic. date-fns has a dedicated `eachWeekOfInterval`, `eachDayOfInterval`, `startOfWeek`, `isWithinInterval` suite that maps directly to grid rendering needs. |
| Tailwind CSS v4 | CSS Modules | CSS Modules require more boilerplate for responsive + print variants. Tailwind's `print:` variant and container queries cover all layout needs with less code. |
| Zustand | TanStack Query | TanStack Query is for server state (fetch/cache/refetch). With Yjs handling sync, there is no traditional API polling — Yjs push updates replace the need for query caching. Use Zustand for local UI state only. |
| Custom CSS Grid | FullCalendar | FullCalendar does not replicate the Google Sheets row-slot model. Its calendar cells are event-list based, not fixed-row-grid based. Building the grid with `display: grid; grid-template-columns: repeat(7, 1fr)` gives full control over the row-slot model, multi-day horizontal spans, and print layout. |
| Custom CSS Grid | React Big Calendar | Same problem as FullCalendar — month/week/agenda views that don't match a scrolling-rows-of-slots model. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Next.js + Vercel (for this project) | Vercel serverless functions cannot hold WebSocket connections. Every real-time pattern on Vercel requires Ably, Pusher, or PartyKit anyway — so you're paying two services. The SPA has no SSR need. | Vite SPA on Cloudflare Pages + PartyKit on Cloudflare Workers. |
| Moment.js | Deprecated since 2020, 70KB minified, mutable API. | date-fns v4 |
| Luxon | Actively maintained but larger than date-fns, and date-fns has better tree-shaking for calendar-specific functions. | date-fns v4 |
| FullCalendar / React Big Calendar | Not designed for a row-slot grid model. Styling overrides to match the project's layout become more work than building the grid from scratch. Print CSS is difficult to customize. | Custom CSS Grid with `display: grid` |
| Redux / Redux Toolkit | Massive boilerplate for what is essentially "which color is selected" and "is print mode on." Yjs owns the shared data so Redux's primary use case (shared client state) is already handled. | Zustand for UI state |
| Firebase Realtime Database / Firestore | Vendor lock-in, cost unpredictability at scale, and Firebase Auth is unnecessary (link-based access). Does not use CRDT — concurrent edits can produce last-write-wins corruption. | Yjs + PartyKit |
| Supabase Realtime | Supabase Realtime uses PostgreSQL row-level subscriptions, not CRDTs. Concurrent edits without a CRDT can corrupt calendar data. Requires a Postgres instance (more ops overhead). | Yjs + PartyKit |
| WebRTC (y-webrtc) | P2P sync works only when at least one peer is online. A family calendar viewed by a single person on a tablet gets no sync until another device joins the WebRTC room. | y-partykit (server-authoritative sync via PartyKit) |

---

## Stack Patterns by Variant

**If the family wants offline-first (calendar works with no internet):**
- Add `y-indexeddb` provider alongside `y-partykit`. Yjs syncs from IndexedDB on load, syncs to PartyKit when online.
- No additional framework changes needed.

**If the family expands to 10+ members and needs access control:**
- PartyKit supports a `onBeforeConnect` hook to validate a token in the WebSocket upgrade request.
- Add a short-lived signed URL or shared secret to the shareable link.
- No auth system needed — still link-based.

**If print fidelity becomes critical (e.g., exact page breaks):**
- Add `@page` CSS rules and Tailwind's `print:` variant classes to the grid container.
- Consider `react-to-print` (wraps `window.print()` with a ref) for triggering the browser print dialog from a button.

**If you later add recurring events with complex RRULE logic:**
- Add `rrule` package (iCalendar RFC 5545 compliant). Integrates with date-fns for expansion of occurrence dates.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| React 19.x | Vite 6.x | Vite's `react-ts` template sets up React 19 correctly. No StrictMode double-invoke issues with Yjs if you initialize `Y.Doc` outside the component or use a ref. |
| date-fns v4.x | TypeScript 5.x | v4 ships its own types; no `@types/date-fns` needed. |
| Tailwind CSS v4.x | Vite 6.x | Use `@tailwindcss/vite` plugin (not the PostCSS plugin). The PostCSS path still works but v4 recommends the Vite-native plugin. |
| shadcn/ui (latest) | Tailwind CSS v4 | shadcn/ui updated to support Tailwind v4 in early 2025. Run `npx shadcn@latest init` after Tailwind v4 is installed. |
| yjs 13.x | y-partykit 0.x | y-partykit is the maintained Yjs provider for PartyKit. y-websocket still works but requires running your own Node.js WebSocket server. |
| Zustand 5.x | React 19.x | Zustand 5 dropped the deprecated `subscribe` API and uses React's `useSyncExternalStore` — fully compatible with React 19 concurrent rendering. |

---

## Sources

- [Vite vs Next.js: Choosing the Right Tool in 2026](https://dev.to/shadcndeck_dev/nextjs-vs-vite-choosing-the-right-tool-in-2026-38hp) — SPA recommendation (MEDIUM confidence, WebSearch)
- [Cloudflare acquires PartyKit](https://blog.cloudflare.com/cloudflare-acquires-partykit/) — PartyKit status and pricing model (HIGH confidence, official blog)
- [Y-PartyKit API docs](https://docs.partykit.io/reference/y-partykit-api/) — y-partykit provider usage (HIGH confidence, official docs)
- [Yjs docs](https://docs.yjs.dev/) — CRDT model, provider ecosystem (HIGH confidence, official docs)
- [Tailwind CSS v4 Complete Guide](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide) — v4 features and Vite plugin (MEDIUM confidence, WebSearch)
- [shadcn/ui Vite installation](https://ui.shadcn.com/docs/installation/vite) — official setup guide (HIGH confidence, official docs)
- [date-fns npm](https://www.npmjs.com/package/date-fns) — current version, TypeScript support (HIGH confidence, npm registry)
- [React v19 release](https://react.dev/blog/2024/12/05/react-19) — React 19 features (HIGH confidence, official blog)
- [Zustand + TanStack Query patterns](https://javascript.plainenglish.io/zustand-and-tanstack-query-the-dynamic-duo-that-simplified-my-react-state-management-e71b924efb90) — state management split (MEDIUM confidence, WebSearch)
- [Vercel WebSocket limitation](https://community.vercel.com/t/feature-request-native-websocket-support-for-next-js-applications-on-vercel/32017) — confirmed Vercel does not support WebSockets (HIGH confidence, Vercel community)
- [Chrome 144 Temporal API](https://www.infoq.com/news/2026/02/chrome-temporal-date-api/) — Temporal browser support status (HIGH confidence, InfoQ)
- [Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) — free tier and usage costs (HIGH confidence, official docs)

---

*Stack research for: family-calendar (grid-based shared family calendar, link access, real-time sync)*
*Researched: 2026-03-10*
