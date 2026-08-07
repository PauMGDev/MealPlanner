/**
 * The generated Prisma client is ESM-only (it uses `import.meta`), while the unit
 * suite runs ts-jest in CommonJS. Unit specs mock PrismaService at the DI boundary
 * and never touch a real client, so Jest maps `generated/prisma/client` here.
 * Integration coverage against a real client lives in `npm run test:e2e`.
 */
export class PrismaClient {}
