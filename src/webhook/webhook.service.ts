import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order, OrderDocument } from '../schemas/order.schema';
import {
  OrderStatus,
  OrderStatusDocument,
} from '../schemas/order-status.schema';
import { WebhookLog, WebhookLogDocument } from '../schemas/webhook-log.schema';
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

    // Generate unique webhook ID for logging
    const webhookId = `WH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Log the webhook event
      const webhookLog = new this.webhookLogModel({
        webhook_id: webhookId,
        event_type: 'payment_update',
        payload: webhookDto,
        status: 'processing',
        processed_at: new Date(),
      });
      await webhookLog.save();

      // Find the order by custom_order_id (which is the order_id in webhook)
      const order = await this.orderModel.findOne({
        custom_order_id: order_info.order_id,
      });

      if (!order) {
        // Update webhook log with error
        await this.webhookLogModel.updateOne(
          { webhook_id: webhookId },
          {
            status: 'failed',
            error_message: 'Order not found',
          },
        );
        throw new NotFoundException(
          `Order with ID ${order_info.order_id} not found`,
        );
      }

      // Find and update the order status
      const updatedOrderStatus = await this.orderStatusModel.findOneAndUpdate(
        { collect_id: order._id },
        {
          order_amount: order_info.order_amount,
          transaction_amount: order_info.transaction_amount,
          payment_mode: order_info.payment_mode,
          payment_details: order_info.payemnt_details, // Note: webhook has typo "payemnt_details"
          bank_reference: order_info.bank_reference,
          payment_message: order_info.Payment_message, // Note: webhook has "Payment_message"
          status: order_info.status.toLowerCase(),
          error_message: order_info.error_message || 'NA',
          payment_time: new Date(order_info.payment_time),
        },
        { new: true, upsert: false },
      );

      if (!updatedOrderStatus) {
        // Update webhook log with error
        await this.webhookLogModel.updateOne(
          { webhook_id: webhookId },
          {
            status: 'failed',
            error_message: 'Order status not found',
          },
        );
        throw new NotFoundException('Order status not found');
      }

      // Update webhook log as successful
      await this.webhookLogModel.updateOne(
        { webhook_id: webhookId },
        { status: 'completed' },
      );

      return {
        success: true,
        message: 'Webhook processed successfully',
        webhook_id: webhookId,
        order_id: order_info.order_id,
        updated_status: order_info.status.toLowerCase(),
      };
    } catch (error) {
      // Update webhook log with error
      await this.webhookLogModel.updateOne(
        { webhook_id: webhookId },
        {
          status: 'failed',
          error_message: error.message || 'Unknown error',
        },
      );

      console.error('Webhook processing error:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to process webhook');
    }
  }
}
