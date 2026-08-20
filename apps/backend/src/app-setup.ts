import { ValidationPipe, type INestApplication } from '@nestjs/common';

/**
 * Everything the running server and the e2e suite must share. Anything that
 * only makes sense for a listening process (CORS, Swagger) stays in main.ts.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  return app;
}
