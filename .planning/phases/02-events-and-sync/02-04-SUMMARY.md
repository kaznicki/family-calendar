---
plan: 02-04
status: complete
---

# Plan 02-04 Summary: Person Color Tokens + EventCard

## What Was Built

1. **8 person color tokens** added to `src/index.css` `@theme {}` block — timur (salmon), lois (pink), joy (mint), ivy (periwinkle), both-girls (cyan), whole-family (yellow), other (peach), unassigned (gray). OKLCH values matched to Google Sheets screenshot.

2. **EventCard component** (`src/components/EventCard.tsx`) — colored chip with `bg-${colorToken}` Tailwind v4 class pattern (NOT bracket syntax), title text, optional time display, click handler.

## Key Decisions

- Used `bg-${colorToken ?? 'unassigned'}` template literal — generates correct utility classes (`bg-lois`, not `bg-[--color-lois]`)
- Root element is `<button type="button">` for keyboard accessibility
- Tailwind v4 @theme tokens are included in output CSS automatically, no purge risk

## Tests

- 6/6 EventCard tests passing (TDD: RED → GREEN cycle completed)
- Full suite: 34 passed, 24 todo, 0 failures

## Commits

- `96e7fd0`: feat(02-04): add 8 person color tokens to @theme block in index.css
- `ed8447b`: feat(02-04): implement EventCard component with TDD — 6 tests passing

## key-files

### created
- src/components/EventCard.tsx
- src/components/EventCard.test.tsx

### modified
- src/index.css
