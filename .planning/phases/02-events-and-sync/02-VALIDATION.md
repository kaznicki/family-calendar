---
phase: 2
slug: events-and-sync
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vite.config.ts` (inline `test` block) |
| **Quick run command** | `npx vitest run src/lib/slotLayout.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/slotLayout.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | EVNT-04, EVNT-06 | unit | `npx vitest run src/lib/slotLayout.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 0 | EVNT-03, EVNT-05, PEPL-04, SHRG-02 | unit | `npx vitest run src/lib/eventStore.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 0 | EVNT-02, PEPL-01 | component | `npx vitest run src/components/EventCard.test.tsx` | ❌ W0 | ⬜ pending |
| 2-01-04 | 01 | 0 | EVNT-01, PEPL-02 | component | `npx vitest run src/components/EventPopover.test.tsx` | ❌ W0 | ⬜ pending |
| 2-01-05 | 01 | 0 | RECU-01, RECU-02 | component | `npx vitest run src/components/RecurringFooter.test.tsx` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 1 | EVNT-04, EVNT-06 | unit | `npx vitest run src/lib/slotLayout.test.ts` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | EVNT-03, EVNT-05, SHRG-02 | unit | `npx vitest run src/lib/eventStore.test.ts` | ❌ W0 | ⬜ pending |
| 2-03-01 | 03 | 2 | EVNT-01, EVNT-02, EVNT-03, PEPL-02 | component | `npx vitest run src/components/EventPopover.test.tsx` | ❌ W0 | ⬜ pending |
| 2-03-02 | 03 | 2 | PEPL-01 | component | `npx vitest run src/components/EventCard.test.tsx` | ❌ W0 | ⬜ pending |
| 2-04-01 | 04 | 3 | RECU-01, RECU-02 | component | `npx vitest run src/components/RecurringFooter.test.tsx` | ❌ W0 | ⬜ pending |
| 2-05-01 | 05 | 4 | PEPL-04 | unit | `npx vitest run src/lib/eventStore.test.ts -t "roster"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/slotLayout.ts` — slot allocation algorithm (new file)
- [ ] `src/lib/slotLayout.test.ts` — exhaustive tests: multi-day slot 0, single-day slots 1-4, overflow, week boundary clamp
- [ ] `src/lib/people.ts` — static person config (id, label, colorToken)
- [ ] `src/lib/eventStore.ts` — useSyncExternalStore binding + addEvent/deleteEvent/roster helpers
- [ ] `src/lib/eventStore.test.ts` — EVNT-03, EVNT-05, PEPL-04, SHRG-02 (in-memory Yjs, no network)
- [ ] `src/components/EventCard.tsx` — colored event chip component
- [ ] `src/components/EventCard.test.tsx` — EVNT-02, PEPL-01
- [ ] `src/components/EventPopover.tsx` — inline create/edit popover
- [ ] `src/components/EventPopover.test.tsx` — EVNT-01, PEPL-02
- [ ] `src/components/RecurringFooter.tsx` — fixed footer grid
- [ ] `src/components/RecurringFooter.test.tsx` — RECU-01, RECU-02
- [ ] `npm install @floating-ui/react` — only new package needed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Person color chips visually match Google Sheets screenshot | PEPL-01 | OKLCH values are approximations; pixel-accurate color requires human eye | Open app + Google Sheets screenshot side-by-side; compare each person's color chip against their column highlight |
| Real-time sync: edits appear on second device without refresh | SHRG-02 | Requires two actual browser tabs/devices on live PartyKit connection | Open app in two browser tabs; add event in tab 1; verify it appears in tab 2 within ~1 second |
| Drag-to-select creates multi-day event correctly on mobile | EVNT-04 | Touch pointer events require physical device or device emulation | Open in Chrome DevTools mobile emulator; drag across 3 days; verify multi-day event created |
| RecurringFooter always visible while scrolling grid | RECU-01 | CSS position:fixed behavior requires visual confirmation | Scroll grid to bottom; verify recurring footer stays anchored at viewport bottom |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
