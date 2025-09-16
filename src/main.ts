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

  // Health endpoint for Railway
  app.getHttpAdapter().get('/', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Use Railway's injected PORT first, then ConfigService, then 3000
  const port = process.env.PORT || configService.get<number>('PORT') || 3000;

  // bind to 0.0.0.0 so Railway can reach the container
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application running on port ${port}`);
}

bootstrap();
