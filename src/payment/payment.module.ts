import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';

import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import {
  OrderStatus,
  OrderStatusSchema,
} from '../transaction/schemas/order-status.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
    ]),
    HttpModule.register({
      timeout: 5000, // 5 sec timeout for payment API calls
      maxRedirects: 5,
    }),
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
