---
phase: 5
slug: visual-and-copy-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vite.config.ts` (test key) |
| **Quick run command** | `npx vitest run src/components/[FileUnderTest].test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/[FileUnderTest].test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 0 | RDBL-01 | unit | `npx vitest run src/components/DayColumn.test.tsx` | ❌ W0 | ⬜ pending |
| 5-01-02 | 01 | 1 | RDBL-01 | unit | `npx vitest run src/components/DayColumn.test.tsx` | ✅ after W0 | ⬜ pending |
| 5-02-01 | 02 | 0 | RDBL-02, RDBL-03 | unit | `npx vitest run src/components/WeekRow.test.tsx src/components/RecurringFooter.test.tsx` | ❌ W0 | ⬜ pending |
| 5-02-02 | 02 | 1 | RDBL-02 | unit | `npx vitest run src/components/WeekRow.test.tsx` | ✅ after W0 | ⬜ pending |
| 5-02-03 | 02 | 1 | RDBL-03 | unit | `npx vitest run src/components/RecurringFooter.test.tsx` | ✅ after W0 | ⬜ pending |
| 5-03-01 | 03 | 0 | STNG-01, STNG-02 | unit | `npx vitest run src/components/SettingsPanel.test.tsx` | ❌ W0 new file | ⬜ pending |
| 5-03-02 | 03 | 1 | STNG-01 | unit | `npx vitest run src/components/SettingsPanel.test.tsx` | ✅ after W0 | ⬜ pending |
| 5-03-03 | 03 | 1 | STNG-02 | unit | `npx vitest run src/components/SettingsPanel.test.tsx` | ✅ after W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] New test cases in `src/components/DayColumn.test.tsx` — RDBL-01: badge (rounded-full element) and font-bold on all date numbers
- [ ] New test cases in `src/components/WeekRow.test.tsx` — RDBL-02: week label class assertions
- [ ] New test cases in `src/components/RecurringFooter.test.tsx` — RDBL-03: day header class assertions
- [ ] `src/components/SettingsPanel.test.tsx` (new file) — STNG-01: section label text-gray-700 class; STNG-02: "Add Person or Group" text render; needs mocks for `../lib/eventStore` and `../lib/people`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Today circular badge legible on 375px mobile | RDBL-01 | Two-digit dates must not clip within circle | Open on mobile/devtools 375px, check today column |
| Week label "immediately identifiable as anchor" | RDBL-02 | Human judgment on visual hierarchy | Scan calendar quickly — week label must pop first |
| Footer headers legible at reading distance | RDBL-03 | Perceived legibility depends on screen brightness | View footer at arm's length on phone |
| Button contrast in settings modal | STNG-01 | Perceived contrast depends on display calibration | Open settings, verify no light-grey-on-white |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
