import { INestApplication, ValidationPipe } from '@nestjs/common';

export function setupApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173' });
}
