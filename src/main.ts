import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Register JwtAuthGuard globally
  const jwtService = app.get(require('@nestjs/jwt').JwtService);
  const configService = app.get(require('@nestjs/config').ConfigService);
  app.useGlobalGuards(new JwtAuthGuard(jwtService, configService));
  
  // Enable CORS for your Vercel frontend
  app.enableCors({
    origin: [
      'https://school-payment-frontend-xi.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on: http://0.0.0.0:${port}`);
}

bootstrap();