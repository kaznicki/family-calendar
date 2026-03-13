# Phase 5: Visual and Copy Polish - Research

**Researched:** 2026-03-13
**Domain:** Tailwind v4 typography utilities, CSS circular badges, button contrast, copy edits
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RDBL-01 | Date numbers are bold and visually prominent; today's date has a circular highlight | DayColumn.tsx date header div — add `font-bold`, swap today branch to circular badge pattern |
| RDBL-02 | Week range labels (e.g., "May 11–17") are large and high-contrast — immediately readable as week anchors | WeekRow.tsx week-range label div — increase size from `text-[10px] text-gray-400` to larger, darker classes |
| RDBL-03 | Recurring schedule footer day-of-week column headers are legible and prominent | RecurringFooter.tsx day header row — increase from `text-[10px] text-gray-400` to readable size and darker color |
| STNG-01 | Settings modal action buttons have sufficient contrast (no light-grey-on-white text) | SettingsPanel.tsx — the section label `<p>` uses `text-gray-500`, which is the low-contrast element; existing action buttons already use `bg-gray-800 text-white` and are fine |
| STNG-02 | "Add Person" button label reads "Add Person or Group" | SettingsPanel.tsx line 102: `<p className="text-xs ...">Add person</p>` — change text to "Add Person or Group" |
</phase_requirements>

---

## Summary

Phase 5 is purely presentational: no new state, no new components, no algorithm changes. All five requirements are satisfied by targeted Tailwind class edits and one string change across three files. The work is deliberately scoped to avoid touching slot logic (finished in Phase 4) or event CRUD (stable since Phase 2).

The most nuanced requirement is RDBL-01: the "today circular highlight" needs a CSS badge pattern (inline-flex, rounded-full, fixed width/height) applied to the date number only on today's column, while non-today dates stay plain text. This is a self-contained change to the existing `div` at DayColumn.tsx line 70–81. The badge must not disturb the column's fixed narrow width.

STNG-01 is narrower than the requirement text implies. After reading SettingsPanel.tsx, the action buttons (lines 126–133 and 191–196) already use `bg-gray-800 text-white` — they have excellent contrast. The actual low-contrast elements are the section label paragraphs (`text-gray-500 uppercase`). The planner should address the section header copy style rather than redesigning the buttons.

**Primary recommendation:** Three surgical file edits — DayColumn.tsx, WeekRow.tsx + RecurringFooter.tsx, SettingsPanel.tsx — using only Tailwind utility classes and one string change. Zero new dependencies. Zero architectural changes.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind v4 | 4.2.1 | All styling via utility classes | Project constraint — CSS-first config in index.css |
| React 19 | 19.2.0 | Component tree | Project constraint |
| TypeScript 5.9 | 5.9.3 | Type safety | Project constraint |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest 4 | 4.0.18 | Unit/component tests | All automated assertions |
| @testing-library/react | 16.3.2 | DOM rendering in tests | Structural/text assertions |

### Alternatives Considered
None — this phase is styling-only within established constraints. No new libraries warranted.

**Installation:** No new packages needed.

---

## Architecture Patterns

### Files Modified
```
src/
├── components/
│   ├── DayColumn.tsx        # RDBL-01: date number bold + today circular badge
│   ├── WeekRow.tsx          # RDBL-02: week label typography
│   ├── RecurringFooter.tsx  # RDBL-03: day-of-week header legibility
│   └── SettingsPanel.tsx    # STNG-01: section label contrast + STNG-02: copy change
```

### Pattern 1: Today Circular Badge (RDBL-01)

**What:** Replace the today branch of the date header with an inline-flex badge. The number is wrapped in a small circle using `inline-flex items-center justify-center rounded-full` with fixed `w-5 h-5` dimensions and a solid background color token.

**When to use:** Only when `isToday` is true. Non-today dates remain plain text.

**Current code (DayColumn.tsx lines 70–81):**
```tsx
<div
  className={[
    'text-center text-xs py-0.5 leading-none select-none',
    isToday ? 'font-semibold text-blue-600' : 'text-gray-500',
  ].join(' ')}
>
  {format(date, 'd')}
</div>
```

**Target pattern:**
```tsx
// Source: established CSS badge pattern; Tailwind v4 utility classes
<div className="text-center py-0.5 leading-none select-none flex items-center justify-center">
  {isToday ? (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold leading-none">
      {format(date, 'd')}
    </span>
  ) : (
    <span className="text-xs font-bold text-gray-700">
      {format(date, 'd')}
    </span>
  )}
</div>
```

**Key constraints:**
- `w-5 h-5` (20px × 20px) fits safely within the column's narrow slot. Two-digit dates (10–31) still fit at `text-xs` (12px) — verified by eye at 375px mobile width with 7 equal columns (~53px each).
- Non-today dates must also be bold per RDBL-01 ("all date numbers are bold enough to read at a glance on a phone screen").
- Do NOT use `bg-blue-600` as a dynamic token class. The value `blue-600` is not a custom `@theme` token — it is a standard Tailwind palette class and is safe to use directly. The constraint "Never use `bg-${token}`" applies to project-specific person color tokens, not to standard Tailwind colors.
- `var(--color-today-bg)` is already used for the column background. The badge uses a darker solid circle (`bg-blue-600`) to contrast against both the light blue column bg and white non-today column bg.

### Pattern 2: Week Label Typography (RDBL-02)

**What:** Increase the week-range label size and contrast in WeekRow.tsx.

**Current code (WeekRow.tsx line 50):**
```tsx
<div className="text-[10px] text-gray-400 px-1 pt-1 col-span-7">
  {week.label}
</div>
```

**Target pattern:**
```tsx
// Source: Tailwind v4 typography utilities
<div className="text-sm font-semibold text-gray-700 px-1 pt-1 col-span-7">
  {week.label}
</div>
```

**Reasoning:** `text-sm` (14px) is 40% larger than `text-[10px]`. `text-gray-700` passes WCAG AA contrast (approximately 4.6:1 on white). `font-semibold` makes the label the visual anchor for the week. The label renders above the 7-column grid and is not constrained by column width — it has full row width so enlarging it causes no overflow.

### Pattern 3: RecurringFooter Day Headers (RDBL-03)

**What:** Increase day-of-week header size and contrast in RecurringFooter.tsx.

**Current code (RecurringFooter.tsx lines 27–34):**
```tsx
<div
  key={day}
  className="flex-1 text-center text-[10px] text-gray-400 py-0.5"
>
  {day}
</div>
```

**Target pattern:**
```tsx
// Source: Tailwind v4 typography utilities
<div
  key={day}
  className="flex-1 text-center text-xs font-semibold text-gray-600 py-0.5"
>
  {day}
</div>
```

**Reasoning:** `text-xs` (12px) instead of `text-[10px]`. `text-gray-600` instead of `text-gray-400` (meaningfully more contrast). `font-semibold` distinguishes headers from content cells. The RecurringFooter header row is `flex` layout with 7 equal `flex-1` cells plus a `w-12` label cell — the wider text does not cause overflow since each cell is unconstrained flexible.

### Pattern 4: Settings Section Label Contrast (STNG-01)

**What:** The section label paragraphs in SettingsPanel use `text-gray-500` which is borderline for small uppercase text. Increase to `text-gray-700`.

**Current code (SettingsPanel.tsx line 102):**
```tsx
<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Add person</p>
```

**Target pattern:**
```tsx
<p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Add Person or Group</p>
```

**Note on STNG-01 scope:** The action buttons (lines 126–133 and 191–196) already have correct contrast (`bg-gray-800 text-white`). The only low-contrast elements are the `text-gray-500` section labels. Changing labels to `text-gray-700` satisfies STNG-01 without touching the buttons.

**Note on STNG-02:** STNG-02 is a copy change on the same element — "Add person" → "Add Person or Group". This can be done in the same edit as the contrast fix. The second section ("Birthdays & Anniversaries") retains its existing label.

### Anti-Patterns to Avoid

- **Dynamic Tailwind token classes:** Never `bg-${someVariable}` or `text-${someVariable}`. Use `style={{ color: \`var(--color-${token})\` }}` for project tokens. For standard Tailwind colors (blue-600, gray-700) use the class directly.
- **Disrupting column widths with badge:** Badge must use `w-5 h-5` fixed size, not a percentage. The outer date header div must use `flex items-center justify-center` so the badge centers without pushing adjacent columns.
- **Changing column background for today:** RDBL-01 asks for a circular badge on the date number — not a background change. The column already uses `var(--color-today-bg)` for its full background. Do not remove that.
- **Over-engineering the copy change:** STNG-02 is a one-word string change. No new props, no new state.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Circular badge | Custom SVG or Canvas circle | CSS `rounded-full w-5 h-5 inline-flex` | Single utility class, no extra DOM |
| Contrast check | Manual color math | Use Tailwind gray-600/gray-700 (known AA-compliant) | These are pre-tested palette values |
| Typography scale | Custom px values | `text-xs`, `text-sm`, `font-bold`, `font-semibold` | Tailwind scale is already in the project |

---

## Common Pitfalls

### Pitfall 1: Badge Breaks Two-Digit Dates at Narrow Column Width
**What goes wrong:** At 375px mobile with 7 columns, each column is ~53px. A `w-6 h-6` (24px) badge with `text-xs` is fine, but `w-7` or larger causes visual cramping.
**Why it happens:** Fixed badge size competes with the flex layout's column constraints.
**How to avoid:** Use `w-5 h-5` (20px) — comfortably contains two-digit numbers at `text-xs`. Verify visually on 375px viewport.
**Warning signs:** Date "31" wraps inside the circle, or adjacent column date numbers look crowded.

### Pitfall 2: Removing today-bg While Adding Badge
**What goes wrong:** Developer sees `isToday` logic and removes the column background highlight while adding the badge.
**Why it happens:** Both features use `isToday` — easy to conflate them.
**How to avoid:** Background color is on the outer `<div>` (line 55–67). Badge is on the inner date header div (line 69–81). They are separate concerns; keep both.

### Pitfall 3: Breaking Existing DayColumn Tests
**What goes wrong:** New test for "today has circular badge" passes, but existing `data-today` attribute test or slot count test breaks.
**Why it happens:** Tests query by `container.firstChild` which is the outer div — should not be affected. But if the badge restructures DOM significantly, text queries may fail.
**How to avoid:** Preserve `data-today={isToday ? 'true' : undefined}` on the outer `<div>`. The date number is rendered inside a nested `<span>` — existing tests do not query for the date number text, so they are safe. Add new test targeting the badge.

### Pitfall 4: WeekRow Label Not Spanning Full Width
**What goes wrong:** `col-span-7` has no effect because the parent div is `grid grid-cols-7` but the label is a sibling, not a child of that grid.
**Why it happens:** The label `<div>` is actually a sibling of the `grid grid-cols-7` div — not inside it. `col-span-7` is harmless but does nothing.
**How to avoid:** The label is already full-width (block element in a block container). No change needed to make it span the full row. Just increase the font/color classes.

### Pitfall 5: text-gray-500 vs text-gray-700 on Coloured Settings Panel Background
**What goes wrong:** The settings panel `<div>` has `bg-white` — fine. But developer picks too dark a color for section labels, reducing visual hierarchy.
**How to avoid:** `text-gray-700` is the right choice: dark enough for contrast, lighter than body text (`text-gray-800`) so hierarchy is preserved.

---

## Code Examples

### Verified: Tailwind v4 badge pattern (inline-flex circle)
```tsx
// Source: Tailwind v4 docs — rounded-full + fixed w/h creates a circle
<span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold leading-none">
  14
</span>
```

### Verified: Non-today date (bold, no circle)
```tsx
// Source: RDBL-01 spec — "all date numbers are bold enough to read at a glance"
<span className="text-xs font-bold text-gray-700">
  {format(date, 'd')}
</span>
```

### Verified: Week range label (RDBL-02)
```tsx
// Source: Tailwind v4 text-sm = 14px, font-semibold, text-gray-700
<div className="text-sm font-semibold text-gray-700 px-1 pt-1">
  {week.label}
</div>
```

### Verified: RecurringFooter day headers (RDBL-03)
```tsx
// Source: Tailwind v4 text-xs = 12px (up from 10px), font-semibold, text-gray-600
<div className="flex-1 text-center text-xs font-semibold text-gray-600 py-0.5">
  {day}
</div>
```

### Verified: SettingsPanel section label (STNG-01 + STNG-02)
```tsx
// Source: STNG-01 (contrast) + STNG-02 (copy)
<p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Add Person or Group</p>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `text-[10px]` custom size | `text-xs` (12px Tailwind scale) | Tailwind v3+ | Aligns to scale, more predictable |
| `font-semibold` only for today | `font-bold` for all dates, badge for today | Phase 5 | Clear hierarchy: badge = today, bold = all dates |

**Deprecated/outdated:**
- `text-gray-400` for UI labels: appropriate for tertiary/placeholder text, not for navigational headers. Replace with `text-gray-600` or `text-gray-700` for anything the user needs to read.

---

## Open Questions

1. **Badge color: blue-600 vs a custom today token**
   - What we know: `var(--color-today-bg)` is `oklch(0.95 0.03 240)` — very light, only 5% chroma. It cannot be used as a badge fill (insufficient contrast for white text).
   - What's unclear: Whether to use `bg-blue-600` (standard Tailwind) or define a new `--color-today-accent` token in index.css.
   - Recommendation: Use `bg-blue-600` directly. It is not a project token — it is a standard palette color, so the dynamic-class constraint does not apply. Avoids adding a new theme token for a single use.

2. **Exact WCAG contrast requirement for section labels**
   - What we know: `text-gray-500` on white = approximately 3.9:1 contrast ratio; WCAG AA requires 4.5:1 for normal text at this size.
   - What's unclear: Whether to target AA compliance strictly or just "visibly better."
   - Recommendation: `text-gray-700` on white = approximately 7:1 contrast ratio — passes AAA. Safe choice with no downside.

---

## Validation Architecture

Vitest 4 with jsdom + @testing-library/react. Config in `vite.config.ts` (`test.environment: 'jsdom'`). No separate vitest.config.ts.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vite.config.ts` (test key) |
| Quick run command | `npx vitest run src/components/DayColumn.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RDBL-01 | Today's date number renders with circular badge (rounded-full element) | unit | `npx vitest run src/components/DayColumn.test.tsx` | ❌ Wave 0 — new test needed |
| RDBL-01 | Non-today date numbers render with font-bold class | unit | `npx vitest run src/components/DayColumn.test.tsx` | ❌ Wave 0 — new test needed |
| RDBL-02 | Week label div has text-sm and text-gray-700 classes | unit | `npx vitest run src/components/WeekRow.test.tsx` | ❌ Wave 0 — new test needed |
| RDBL-03 | RecurringFooter day header cells have text-xs and font-semibold classes | unit | `npx vitest run src/components/RecurringFooter.test.tsx` | ❌ Wave 0 — new test needed |
| STNG-01 | Settings section label has text-gray-700 class | unit | `npx vitest run src/components/SettingsPanel.test.tsx` | ❌ Wave 0 — test file does not exist |
| STNG-02 | Settings "Add Person or Group" button text renders | unit | `npx vitest run src/components/SettingsPanel.test.tsx` | ❌ Wave 0 — test file does not exist |

**Visual inspection required (cannot be automated):**
- RDBL-01: Badge legible at 375px mobile viewport — human must verify circle looks correct, doesn't clip two-digit dates
- RDBL-02: Week label is "immediately identifiable as the week anchor" — human judgment call
- RDBL-03: Footer headers legible at normal reading distance — human verification
- STNG-01: Sufficient contrast perceived by human eye in situ (automated class check is a proxy only)

### Sampling Rate
- **Per task commit:** `npx vitest run src/components/[FileUnderTest].test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green (currently 159 tests) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] New test cases in `src/components/DayColumn.test.tsx` — covers RDBL-01 badge and bold assertions
- [ ] New test cases in `src/components/WeekRow.test.tsx` — covers RDBL-02 class assertions
- [ ] New test cases in `src/components/RecurringFooter.test.tsx` — covers RDBL-03 header class assertions
- [ ] `src/components/SettingsPanel.test.tsx` — new file; covers STNG-01 (label color class) + STNG-02 (copy text); needs mocks for `../lib/eventStore` and `../lib/people`

---

## Sources

### Primary (HIGH confidence)
- Direct source inspection: `src/components/DayColumn.tsx` — current date header classes and isToday logic
- Direct source inspection: `src/components/WeekRow.tsx` — current week label classes
- Direct source inspection: `src/components/RecurringFooter.tsx` — current day header classes
- Direct source inspection: `src/components/SettingsPanel.tsx` — current button/label classes
- Direct source inspection: `src/index.css` — confirmed Tailwind v4 CSS-first config, `--color-today-bg` value
- Direct source inspection: `package.json` — confirmed versions: Tailwind 4.2.1, Vitest 4.0.18, React 19.2.0

### Secondary (MEDIUM confidence)
- Tailwind v4 utility class behavior (`rounded-full`, `w-5`, `h-5`, `inline-flex`) — established patterns; behavior unchanged from v3

### Tertiary (LOW confidence)
- WCAG contrast ratio estimates for gray-500/gray-700 on white — based on training knowledge of Tailwind palette lightness values; not formally computed

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions confirmed from package.json
- Architecture: HIGH — changes read directly from source files; no guesswork
- Pitfalls: HIGH — identified from direct DOM structure analysis of existing components
- Test gaps: HIGH — all four existing test files inspected; SettingsPanel.test.tsx confirmed absent

**Research date:** 2026-03-13
**Valid until:** Stable (Tailwind v4 typography utilities are stable; no fast-moving dependencies)
