// src/seeds/main.seed.ts
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  await app.close();
}
bootstrap();
