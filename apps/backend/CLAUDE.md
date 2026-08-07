# apps/backend — CLAUDE.md

NestJS 11, ESM (`"type": "module"`) — every relative import MUST end in `.js`
(`import { AuthService } from './auth.service.js'`). Prisma 7 with the `prisma-client`
generator + `@prisma/adapter-pg`. Swagger at `/api/docs`. Global prefix `api`.

## Module pattern (mirror an existing module, e.g. `recipes/`)

```
src/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts   → routes, guards, Swagger decorators, no logic
├── <feature>.service.ts      → all logic, takes userId explicitly
└── dto/                      → class-validator DTOs
```

- Global `ValidationPipe` runs with `whitelist + forbidNonWhitelisted + transform`:
  any request field not declared in a DTO is a 400. Update DTOs when adding fields.
- Ownership pattern: service methods receive `userId` from the JWT (via controller),
  `findOne` throws `NotFoundException` (missing) / `ForbiddenException` (not owner),
  and mutations call `findOne` first. Never trust ids from the body for ownership.
- Auth: local (bcrypt) + Google OAuth. Google callback redirects to
  `FRONTEND_URL/auth/callback?token=...`. `getOrThrow('FRONTEND_URL')` — the app
  crashes at OAuth time if unset.

## Prisma

- Schema at `prisma/schema.prisma`; config in `prisma.config.ts` (schema path,
  migrations path, seed command `npx tsx prisma/seed.ts`).
- Generated client at `src/generated/prisma` — never edit, never import internals;
  import types from `../generated/prisma/client.js`.
- DB naming: snake_case via `@map`/`@@map`; keep that on new fields/models.
- Workflow for schema changes: edit schema → `npx prisma migrate dev --name <desc>`
  → `npx prisma generate` → update DTOs and affected services → update seed if the
  change affects seeded data. Never edit an applied migration; create a new one.
- `pg_trgm` extension is required (fuzzy ingredient search). Any new fuzzy-search
  feature should reuse it, not load a JS fuzzy lib.

## Testing (Jest)

- Unit: `npm test` (`*.spec.ts` next to sources). E2E: `npm run test:e2e`
  (`test/jest-e2e.json`), runs against a real DB — assume docker-compose Postgres.
- Mock `PrismaService` at the service boundary in unit tests; do not spin up the DB
  for unit specs.

## Gotchas

- CORS accepts exactly ONE origin (`FRONTEND_URL`). Multi-origin needs a code change
  in `main.ts`, not just env.
- JWT payload is `{ sub, email }`; `/auth/me` returns the full user minus passwordHash.
  If the frontend needs more claims, change `generateToken` AND the frontend JwtPayload.
- `MealType` enum: BREAKFAST, ALMUERZO, LUNCH, SNACK, DINNER — one meal per
  (user, date, type), enforced by a DB constraint. Upserts, not inserts, for slots.
- `User.activeMealTypes` (MealType[], default BREAKFAST/LUNCH/DINNER) drives the rows of
  the frontend weekly matrix. Edited via `PATCH /users/me/settings`, validated 3 to 5
  entries. Turning a slot off never deletes its meals.
- Unit specs run ts-jest in CommonJS while the app is ESM, so `generated/prisma/client`
  is mapped to `test/prisma-client.stub.ts` (see the `jest` block in package.json).
  Specs mock PrismaService at the DI boundary; real-client coverage is `test:e2e`.
