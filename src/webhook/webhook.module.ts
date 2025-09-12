import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { Order, OrderSchema } from '../payment/schemas/order.schema';
import { OrderStatus, OrderStatusSchema } from '../transaction/schemas/order-status.schema';
import { WebhookLog, WebhookLogSchema } from './schemas/webhook-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
      { name: WebhookLog.name, schema: WebhookLogSchema },
    ]),
  ],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
