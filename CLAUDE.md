# MealPlanner — CLAUDE.md (root)

Weekly meal planning app: recipes, personal pantry, weekly calendar and shopping list.
Portfolio project — code quality and reviewability matter as much as the feature itself.

## Monorepo layout

```
apps/
├── frontend/   → Angular 22 + Tailwind CSS 4 (Vercel)      → see apps/frontend/CLAUDE.md
└── backend/    → NestJS 11 + Prisma 7 + PostgreSQL (Railway) → see apps/backend/CLAUDE.md
.agents/skills/ → design skills (taste-skill family), used for landing/visual work only
```

There is NO workspace root package.json with shared scripts. Run every command from
inside `apps/frontend` or `apps/backend`.

## Commands

| Task | Frontend (`apps/frontend`) | Backend (`apps/backend`) |
|---|---|---|
| Dev server | `npm start` (port 4200) | `npm run start:dev` (port 3000) |
| Build | `npm run build` (prod by default) | `npm run build` |
| Tests | `npm test` (Vitest via `ng test`) | `npm test` (Jest) · `npm run test:e2e` |
| Lint | — | `npm run lint` |
| DB | — | `npx prisma migrate dev` · `npx prisma db seed` |

Local DB: `docker-compose.yml` at repo root brings up PostgreSQL (needs `pg_trgm`).
Prisma is configured via `prisma.config.ts` (not package.json). Client is generated to
`apps/backend/src/generated/prisma` — NEVER edit generated files; run `npx prisma generate`
after any schema change.

## Environments & deploy

- Frontend prod API URL is hardcoded in `src/environments/environment.ts` (Railway URL).
  Dev uses `environment.development.ts` (localhost:3000) via fileReplacements.
- Backend env vars: see `apps/backend/.env.example`. `FRONTEND_URL` is the ONLY CORS
  origin accepted — exact match, no trailing slash.
- Deploy: Vercel builds `apps/frontend` (see `vercel.json`, SPA rewrite to index.html).
  Railway runs the backend. Google OAuth callback URL must match in Railway env AND
  Google Cloud console.

## Cross-cutting rules

- Auth: JWT (7d) issued by backend, stored in localStorage (`mm_token`), attached by
  `authInterceptor`, validated by `authGuard` (front) and `JwtAuthGuard` (back).
  Every backend service method takes `userId` and enforces ownership — keep that pattern.
- The `MealType` enum has FIVE values including both `ALMUERZO` and `LUNCH` ("Almuerzo"
  = mid-morning, "Comida" = lunch, Spanish meal culture). Do not "fix" this to 3 meals.
- Dates travel as ISO strings; day comparisons use `date.slice(0, 10)`. Keep consistent.
- One design token set for the whole product: `lp-*` in `styles.css`, light only,
  documented in the `mealmap-design-system` skill (read it before any UI change and
  update it in the same commit when a design decision changes). The old `mm-*` dark app
  palette was removed; `hk-*` is legacy and unused.
- All user-facing copy is in Spanish. Code, comments and commits in English.

## Verification before claiming done

1. `npm run build` passes in the app(s) you touched.
2. `npm test` passes in the app(s) you touched — no skipped/commented tests.
3. If the schema changed: migration created, `prisma generate` ran, seed still works.
4. UI changes: check both empty states and populated states, and check mobile at 375px;
   every surface is light.

## Known landmines

- Writing to signals inside `computed()` throws NG0600 at runtime. Angular builds do
  NOT catch this. (This exact bug shipped once in `auth.service.ts`.)
- Frontend tests are Vitest. The Jasmine API (`jasmine.createSpyObj`, `jasmine.SpyObj`)
  does not exist — use `vi.fn()` / `vi.mocked()`.
- `prisma generate` downloads engines from binaries.prisma.sh — fails offline/behind
  restrictive proxies. Not a code bug.
- Production build inlines Google Fonts from index.html at build time — needs network.
