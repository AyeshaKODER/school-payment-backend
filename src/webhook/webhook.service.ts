import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order, OrderDocument } from '../payment/schemas/order.schema';
import {
  OrderStatus,
  OrderStatusDocument,
} from '../transaction/schemas/order-status.schema';
import { WebhookLog, WebhookLogDocument } from './schemas/webhook-log.schema';
import { WebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name)
    private orderStatusModel: Model<OrderStatusDocument>,
    @InjectModel(WebhookLog.name)
    private webhookLogModel: Model<WebhookLogDocument>,
  ) {}

  async processWebhook(webhookDto: WebhookDto) {
    const { status, order_info } = webhookDto;

    const webhookId = `WH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Log webhook event
      const webhookLog = new this.webhookLogModel({
        webhook_id: webhookId,
        event_type: 'payment_update',
        payload: webhookDto,
        status: 'processing',
        processed_at: new Date(),
      });
      await webhookLog.save();

      // Find the order by custom_order_id
      const order = await this.orderModel.findOne({
        custom_order_id: order_info.order_id,
      });

      if (!order) {
        await this.webhookLogModel.updateOne(
          { webhook_id: webhookId },
          { status: 'failed', error_message: 'Order not found' },
        );
        throw new NotFoundException(`Order with ID ${order_info.order_id} not found`);
      }

      // Update order status
      const updatedOrderStatus = await this.orderStatusModel.findOneAndUpdate(
        { collect_id: order._id },
        {
          order_amount: order_info.order_amount,
          transaction_amount: order_info.transaction_amount,
          payment_mode: order_info.payment_mode,
          payment_details: order_info.payment_details, // corrected
          bank_reference: order_info.bank_reference,
          payment_message: order_info.payment_message, // corrected
          status: String(status).toLowerCase(), // ensure string
          error_message: order_info.error_message || 'NA',
          payment_time: new Date(order_info.payment_time),
        },
        { new: true, upsert: false },
      );

      if (!updatedOrderStatus) {
        await this.webhookLogModel.updateOne(
          { webhook_id: webhookId },
          { status: 'failed', error_message: 'Order status not found' },
        );
        throw new NotFoundException('Order status not found');
      }

      // Mark webhook log as completed
      await this.webhookLogModel.updateOne(
        { webhook_id: webhookId },
        { status: 'completed' },
      );

      return {
        success: true,
        message: 'Webhook processed successfully',
        webhook_id: webhookId,
        order_id: order_info.order_id,
        updated_status: String(status).toLowerCase(),
      };
    } catch (error: any) {
      await this.webhookLogModel.updateOne(
        { webhook_id: webhookId },
        {
          status: 'failed',
          error_message: error?.message || 'Unknown error',
        },
      );

      console.error('Webhook processing error:', error);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('Failed to process webhook');
    }
  }
}
