# apps/frontend — CLAUDE.md

Angular 21, standalone components only, Tailwind CSS 4 (CSS-first config in `styles.css`,
no tailwind.config file). No NgModules, no SSR.

## Component conventions (follow the existing code, it is consistent)

- `ChangeDetectionStrategy.OnPush` on every component.
- State = signals. Derived state = `computed()`. NEVER write to a signal inside a
  `computed()` — side effects go in the interceptor, an `effect()`, or event handlers.
- DI with `inject()`, never constructor parameters.
- Async: `toObservable(signal).pipe(switchMap(...))` for reactive reloads (see
  `weekly-calendar.component.ts`), `takeUntilDestroyed(this.destroyRef)` on every
  subscribe inside methods.
- Mutations use optimistic update + snapshot rollback on error (see `removeSlot` /
  `onDetailRemoved` in weekly-calendar). Keep that pattern for new mutations.
- Routes are lazy (`loadComponent`) except the landing. New feature pages hang off
  `/app` behind `authGuard`.

## Structure

```
src/app/
├── core/        → services (HTTP, one per API resource), guards, interceptors, models
├── landing/     → public landing (lp-* tokens, light only)
├── auth/        → login, register, oauth callback
├── shell/       → authenticated app (mm-* tokens, dark only)
│   └── <feature>/  → feature component + components/ + <feature>.types.ts (+ spec)
└── shared/      → icons, reusable UI
```

- Services in `core/services` are thin HTTP wrappers returning typed observables.
  Business/display logic lives in components or in `<feature>.types.ts` pure functions
  (which is what gets unit-tested).
- Types live in `core/models/*.types.ts` (API contracts) and `shell/<feature>/*.types.ts`
  (view logic). Re-export API types from the service for convenience.

## Styling

- App shell: `mm-*` tokens (bg-mm-base, text-mm-text1/2/3, bg-mm-card...), semantic
  `success/warning/caution/danger`, meal-type colors `meal-breakfast|almuerzo|lunch|snack|dinner`.
- Landing and future public surfaces: `lp-*` tokens, light only, never a `dark:`
  variant. **The design source of truth is the `mealmap-design-system` skill**
  (`.claude/skills/mealmap-design-system/SKILL.md`): read it before any visual or UI
  change, and update it in the same commit when a design decision changes.
- Auth pages: `hk-*` mapped Material-ish tokens (`bg-surface`, `text-on-surface`...).
- Tailwind classes must be complete literals (JIT): build full class strings in TS
  constants like `MEAL_ROWS`, never concatenate fragments.
- Fonts loaded from Google Fonts in index.html: Work Sans (display), Source Sans 3
  (body), JetBrains Mono (data), Plus Jakarta Sans, Caveat.

## Testing (Vitest)

- `npm test` runs `ng test` → Vitest. Jasmine API is FORBIDDEN (`jasmine.*` does not
  compile). Use `vi.fn()`, `vi.spyOn`, plain objects for stubs.
- Unit-test pure logic in `*.types.ts` first; component tests via TestBed where needed.
- Mocks of API types must satisfy the full interface — build small factory helpers
  instead of casting incomplete literals to `Recipe`/`PantryItem`.
