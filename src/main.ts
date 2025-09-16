import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { PaymentController } from './payment/payment.controller';
import { TransactionController } from './transaction/transaction.controller';
import { WebhookController } from './webhook/webhook.controller';

@Module({
  controllers: [
    AppController,
    AuthController,
    PaymentController,
    TransactionController,
    WebhookController,
  ],
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // allow frontend requests
  await app.listen(process.env.PORT || 3000);
  console.log('🚀 Server running on port', process.env.PORT || 3000);
}
bootstrap();
