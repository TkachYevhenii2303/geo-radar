import { config } from 'dotenv';

config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalErrorHandlerFilter } from './configs/handlers/global-error-handler.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const configs = new DocumentBuilder()
    .setTitle('Swagger backend')
    .setDescription('Swagger backend docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, configs));

  app.useGlobalFilters(new GlobalErrorHandlerFilter());
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    exposedHeaders: ['Content-Range', 'Set-Cookie'],
    credentials: true,
  });

  const port = process.env.PORT ?? 8080;
  await app.listen(port, () => {
    console.log(`🚀 The backend is running on http://localhost:${port}/api`);
    console.log(`📚 The Swagger is running on http://localhost:${port}/docs`);
  });
}

bootstrap();
