// 3. Replace src/main.ts with this ultra-simple version:

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

// Ultra-minimal module
export class AppModule {}

async function bootstrap() {
  console.log('🚀 Starting app with ts-node...');
  console.log('📊 Node version:', process.version);
  console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 PORT:', process.env.PORT);

  const app = await NestFactory.create(AppModule);

  // Root endpoint
  app.getHttpAdapter().get('/', (req, res) => {
    console.log('📥 Root request received');
    res.status(200).json({
      status: 'OK',
      message: 'School Payment API is ALIVE!',
      timestamp: new Date().toISOString(),
      method: 'ts-node direct execution',
    });
  });

  // Health endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', method: 'ts-node' });
  });

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');
  console.log(`✅ SUCCESS! App running on http://0.0.0.0:${port}`);
  console.log(
    `🎯 Try: http://0.0.0.0:${port}/ and http://0.0.0.0:${port}/health`,
  );
}

bootstrap().catch((error) => {
  console.error('💥 Startup failed:', error);
  process.exit(1);
});
