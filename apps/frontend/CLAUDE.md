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
- Mutations write optimistically and, on error, refetch the affected aggregate instead
  of restoring a snapshot (see the slot mutations in `dashboard.component.ts`). A
  snapshot taken while another mutation is in flight already contains that mutation's
  unconfirmed state, so restoring it silently drops it.
- Routes are lazy (`loadComponent`) except the landing. New feature pages hang off
  `/app` behind `authGuard`.

## Structure

```
src/app/
├── core/        → services (HTTP, one per API resource), guards, interceptors, models
├── landing/     → public landing (lp-* tokens, light only)
├── auth/        → login, register, oauth callback
├── shell/       → authenticated app (lp-* tokens, light only)
│   └── <feature>/  → feature component + components/ + <feature>.types.ts (+ spec)
└── shared/      → icons, reusable UI
```

- Services in `core/services` are thin HTTP wrappers returning typed observables.
  Business/display logic lives in components or in `<feature>.types.ts` pure functions
  (which is what gets unit-tested).
- Types live in `core/models/*.types.ts` (API contracts) and `shell/<feature>/*.types.ts`
  (view logic). Re-export API types from the service for convenience.

## Styling

- Every surface (landing, auth, app shell) uses the `lp-*` tokens, light only, never a
  `dark:` variant. **The design source of truth is the `mealmap-design-system` skill**
  (`.claude/skills/mealmap-design-system/SKILL.md`): read it before any visual or UI
  change, and update it in the same commit when a design decision changes. The shell
  specifics live in its "Application surface" chapter.
- `lp-*` component classes are unlayered, so they beat Tailwind utilities. Never fight
  one with a utility; add a modifier class.
- `[class]="expr"` replaces the whole class attribute in Angular. Static classes on the
  same element are dropped silently.
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
