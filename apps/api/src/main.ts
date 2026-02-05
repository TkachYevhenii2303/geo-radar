import { config } from 'dotenv';

config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configs = new DocumentBuilder()
    .setTitle('Swagger backend')
    .setDescription('Swagger backend docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, configs));
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    exposedHeaders: ['Content-Range', 'Set-Cookie'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log(`🚀 The backend is running on http://localhost:${port}`);
    console.log(`📚 The Swagger is running on http://localhost:${port}/docs`);
  });
}

bootstrap();
