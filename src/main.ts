import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

// ✅ Import express types for req/res
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ✅ CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // ✅ Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ✅ Root endpoint (Railway healthcheck)
  const server = app.getHttpAdapter().getInstance();
  server.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      message: 'Backend is running 🚀',
      timestamp: new Date().toISOString(),
    });
  });

  // ✅ Explicit health endpoint
  server.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      message: 'Healthcheck passed ✅',
      timestamp: new Date().toISOString(),
    });
  });

  // ✅ Dynamic PORT (Railway → .env → fallback)
  const port = process.env.PORT || configService.get<number>('PORT') || 3000;

  // ✅ Bind to 0.0.0.0 so Railway can reach the container
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application running on port ${port}`);
}

bootstrap();
