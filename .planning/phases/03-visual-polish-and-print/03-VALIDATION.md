---
phase: 3
slug: visual-polish-and-print
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | vite.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 0 | VISU-02, VISU-03 | unit stub | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 0 | PEPL-03 | unit stub | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 0 | PRNT-01 | manual stub | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | VISU-02, VISU-03 | unit | `npx vitest run` | ✅ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | PEPL-03 | unit | `npx vitest run` | ✅ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | VISU-02, VISU-03 | unit + visual | `npx vitest run` | ✅ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | PEPL-03 | unit + visual | `npx vitest run` | ✅ W0 | ⬜ pending |
| 03-04-01 | 04 | 3 | PRNT-01 | manual | n/a — manual only | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/holidays.test.ts` — stubs for VISU-02 (holiday Yjs store) and VISU-03 (toggle behavior)
- [ ] `src/lib/birthdays.test.ts` — stubs for PEPL-03 (birthday store, annual recurrence)
- [ ] `src/components/DayColumn.test.ts` — extend existing stubs for holiday tint and birthday tint props

*Existing vitest infrastructure (vite.config.ts + vitest.setup.ts) covers all tooling needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Print dialog produces clean 7-col grid | PRNT-01 | Browser print dialog not automatable in Vitest | Open app, click Print button, verify grid in print preview — no collapsing columns, no overflow, page breaks between weeks. Test in Chrome, Safari, Firefox. |
| Long-press on mobile triggers context menu | VISU-02 | Touch events not reliably emulatable in jsdom | On a real iOS/Android device, long-press a day column header for 500ms — context menu should appear with "Mark as holiday" option. |
| Holiday + birthday on same day shows birthday tint | PEPL-03 + VISU-02 | Visual layering | Toggle a day as holiday, also add a birthday entry for same date — day should show birthday (gold) tint, not holiday (gray) tint. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
