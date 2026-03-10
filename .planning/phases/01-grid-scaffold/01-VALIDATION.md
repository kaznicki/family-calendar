---
phase: 1
slug: grid-scaffold
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | `vite.config.ts` (inline `test` block) |
| **Quick run command** | `npx vitest run --reporter=dot` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/dates.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 0 | GRID-01 | unit | `npx vitest run src/lib/dates.test.ts -t "generateWeeks"` | ❌ W0 | ⬜ pending |
| TBD | 01 | 0 | GRID-02 | unit | `npx vitest run src/lib/dates.test.ts -t "formatWeekRange"` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | GRID-03 | component | `npx vitest run src/components/WeekRow.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | GRID-04 | component | `npx vitest run src/components/DayColumn.test.tsx -t "today"` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | VISU-01 | component | `npx vitest run src/components/DayColumn.test.tsx -t "weekend"` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | VISU-04 | component | `npx vitest run src/components/DayColumn.test.tsx -t "today"` | ❌ W0 | ⬜ pending |
| TBD | 01 | 2 | SHRG-01 | unit | `npx vitest run src/lib/token.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/dates.test.ts` — stubs for GRID-01, GRID-02
- [ ] `src/lib/token.test.ts` — stub for SHRG-01
- [ ] `src/components/WeekRow.test.tsx` — stub for GRID-03
- [ ] `src/components/DayColumn.test.tsx` — stubs for GRID-04, VISU-01, VISU-04
- [ ] `src/test/setup.ts` — shared fixtures (jest-dom + cleanup)
- [ ] Framework install: `npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 375px mobile layout renders without overflow | GRID-04 | Visual viewport testing | Open in Chrome DevTools → set to 375px → verify no horizontal scroll and all 7 columns visible |
| Today column is visually highlighted | VISU-04 | CSS visual check | Open app → confirm today's column has distinct background color vs other days |
| Weekend columns have distinct gray background | VISU-01 | CSS visual check | Open app → verify Sat/Sun columns appear gray compared to weekday columns |
| Grid scrolls vertically without horizontal scroll on mobile | GRID-01 | Visual/UX check | Open on real 375px device or DevTools → scroll down through weeks |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
