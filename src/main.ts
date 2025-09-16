import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
  console.log('🚀 Server running');
}
bootstrap();
