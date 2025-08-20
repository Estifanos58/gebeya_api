import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('GEBEYA Multi Vender API')
    .setDescription('Your API description')
    .setVersion('1.0')
    .addServer(`${process.env.PUBLIC_URL}`, 'Production environment')
    .addTag('Your API Tag')
    .build();

const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(new Logger());
  app.use(cookieParser()); // Use cookie parser middleware to parse cookies
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
