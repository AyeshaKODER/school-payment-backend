import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ✅ Proper healthcheck endpoint for Railway
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  });

  // ✅ Use Railway’s injected env var directly as fallback
  const port = process.env.PORT || configService.get<number>('PORT') || 3000;

  // ✅ Important: bind to 0.0.0.0 so Railway can access it
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application running on port ${port}`);
}

bootstrap();
