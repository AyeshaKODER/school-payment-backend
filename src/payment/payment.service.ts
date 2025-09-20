import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../transaction/schemas/order-status.schema';

export interface CreatePaymentDto {
  school_id: string;
  trustee_id: string;
  student_info: {
    name: string;
    id: string;
    email: string;
  };
  gateway_name: string;
  order_amount: number;
  payment_mode: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
    private configService: ConfigService,
  ) {}

  // ✅ Create payment
  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      const custom_order_id = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const order = new this.orderModel({
        ...createPaymentDto,
        custom_order_id,
      });

      const savedOrder = await order.save();

      // ⚡ Cast _id to ObjectId / string
      const orderId: string = (savedOrder._id as any).toString();

      const orderStatus = new this.orderStatusModel({
        collect_id: savedOrder._id,
        custom_order_id,
        order_amount: createPaymentDto.order_amount,
        transaction_amount: createPaymentDto.order_amount,
        payment_mode: createPaymentDto.payment_mode,
        payment_details: 'Pending',
        bank_reference: 'PENDING',
        payment_message: 'Payment initiated',
        status: 'pending',
        error_message: 'NA',
        payment_time: new Date(),
      });

      await orderStatus.save();

      const jwtPayload = {
        collect_id: orderId,
        order_amount: createPaymentDto.order_amount,
        custom_order_id,
        school_id: createPaymentDto.school_id,
        student_info: createPaymentDto.student_info,
        timestamp: Date.now(),
      };

      const apiKey = this.configService.get<string>('API_KEY') || 'default-api-key';
      const signedToken = jwt.sign(jwtPayload, apiKey, { expiresIn: '1h' });

return {
  success: true,
  custom_order_id,
  payment_url: `https://payment-gateway.example.com/pay/${custom_order_id}`,
  order_id: orderId,  // ✅ now it's always string
  message: 'Payment request created successfully',
};
    } catch (error) {
      const err = error as Error;
      this.logger.error('Payment creation error', err.message, err.stack);
      throw new InternalServerErrorException('Failed to create payment request');
    }
  }

  // ✅ Check payment status
  async checkPaymentStatus(orderId: string) {
    const orderStatus = await this.orderStatusModel.findOne({ collect_id: new Types.ObjectId(orderId) });

    if (!orderStatus) {
      throw new NotFoundException(`No payment status found for order ${orderId}`);
    }

    return {
      orderId,
      status: orderStatus.status,
      transaction_amount: orderStatus.transaction_amount,
      payment_mode: orderStatus.payment_mode,
      payment_time: orderStatus.payment_time,
    };
  }

  // ✅ Handle payment gateway webhook
  async handleWebhook(payload: any) {
    this.logger.log(`Received webhook: ${JSON.stringify(payload)}`);

    // Example: update order status based on webhook payload
    if (payload.custom_order_id && payload.status) {
      await this.orderStatusModel.findOneAndUpdate(
        { custom_order_id: payload.custom_order_id },
        { status: payload.status, payment_message: payload.message || '' },
      );
    }

    return { success: true, message: 'Webhook processed successfully' };
  }
}
