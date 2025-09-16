import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';

class SimpleAppModule {}

async function bootstrap(): Promise<void> {
  console.log('Starting School Payment API...');
  console.log('Node version:', process.version);
  console.log('Environment:', process.env.NODE_ENV || 'development');

  try {
    const app: INestApplication = await NestFactory.create(SimpleAppModule);

    // Root endpoint
    app.getHttpAdapter().get('/', (req: any, res: any) => {
      res.status(200).json({
        status: 'OK',
        message: 'School Payment API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    });

    // Health endpoint
    app.getHttpAdapter().get('/health', (req: any, res: any) => {
      res.status(200).json({ status: 'healthy' });
    });

    const port: number = parseInt(process.env.PORT || '3000', 10);

    await app.listen(port, '0.0.0.0');
    console.log(`✅ Application successfully started on port ${port}`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch((error: Error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
