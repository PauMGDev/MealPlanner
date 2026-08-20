import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request, { type Response } from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app-setup.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

/**
 * Runs against a real database (docker-compose Postgres locally, a service
 * container in CI). It registers a throwaway user and deletes it afterwards,
 * so it can run repeatedly against the same database.
 */
/** supertest types every body as `any`; these name what each endpoint returns. */
const asAuth = (res: Response) => res.body as { access_token: string };
const asRecipe = (res: Response) => res.body as { id: string; name: string; servings: number };
const asRecipeList = (res: Response) => res.body as { id: string }[];

describe('API (e2e)', () => {
  let app: INestApplication<Server>;
  let prisma: PrismaService;
  let token: string;

  const email = `e2e-${process.pid}-${Date.now()}@mealplanner.test`;
  const password = 'e2e-password';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = configureApp(moduleFixture.createNestApplication()) as INestApplication<Server>;
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('registers a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email, password, name: 'E2E User' })
      .expect(201);

    expect(typeof asAuth(res).access_token).toBe('string');
  });

  it('rejects a field the DTO does not declare', () =>
    request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: `other-${email}`, password, name: 'E2E User', role: 'ADMIN' })
      .expect(400));

  it('logs in and returns a token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    token = asAuth(res).access_token;
    expect(typeof token).toBe('string');
  });

  it('refuses an unauthenticated request', () =>
    request(app.getHttpServer()).get('/api/recipes').expect(401));

  it('starts with an empty recipe list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/recipes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('creates a recipe and returns it to its owner', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Tortilla de patatas',
        prepTime: 30,
        servings: 4,
        steps: ['Pelar las patatas', 'Cuajar la tortilla'],
      })
      .expect(201);

    expect(asRecipe(created)).toMatchObject({ name: 'Tortilla de patatas', servings: 4 });

    const list = await request(app.getHttpServer())
      .get('/api/recipes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(asRecipeList(list)).toHaveLength(1);
    expect(asRecipeList(list)[0].id).toBe(asRecipe(created).id);
  });

  it("hides another user's recipe", async () => {
    const other = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: `stranger-${email}`, password, name: 'Stranger' })
      .expect(201);

    const mine = await request(app.getHttpServer())
      .get('/api/recipes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/recipes/${asRecipeList(mine)[0].id}`)
      .set('Authorization', `Bearer ${asAuth(other).access_token}`)
      .expect(403);

    await prisma.user.deleteMany({ where: { email: `stranger-${email}` } });
  });
});
