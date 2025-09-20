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
  
  // Add /api prefix to all routes (CRITICAL for frontend connection)
  app.setGlobalPrefix('api');
  
  // Enable CORS for your Vercel frontend
  app.enableCors({
    origin: [
      'https://school-payment-frontend-xi.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Root endpoint with API documentation (fixes 404 on /)
  app.getHttpAdapter().get('/', (req, res) => {
    res.status(200).json({
      message: 'School Payment Management API',
      status: 'OK',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: [
          'POST /api/auth/login',
          'POST /api/auth/register',
          'GET /api/auth/profile'
        ],
        transactions: [
          'GET /api/transactions',
          'GET /api/transactions/:school_id',
          'POST /api/check-status'
        ],
        payments: [
          'POST /api/payment/create-payment'
        ],
        webhooks: [
          'POST /api/webhook'
        ]
      },
      demo_credentials: {
        username: 'admin@gmail.com',
        password: 'admin'
      }
    });
  });

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on: http://0.0.0.0:${port}`);
  console.log(`API endpoints available at: http://0.0.0.0:${port}/api`);
  console.log(`Health check: http://0.0.0.0:${port}/health`);
}

bootstrap();