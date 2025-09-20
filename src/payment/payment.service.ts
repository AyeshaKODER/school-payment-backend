import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
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
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
    private configService: ConfigService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      // Generate unique custom_order_id
      const custom_order_id = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create order in database
      const order = new this.orderModel({
        ...createPaymentDto,
        custom_order_id,
      });
      
      const savedOrder = await order.save();

      // Create initial order status
      const orderStatus = new this.orderStatusModel({
        collect_id: savedOrder._id,
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

      // Prepare JWT payload for payment gateway
      const jwtPayload = {
        collect_id: savedOrder._id.toString(),
        order_amount: createPaymentDto.order_amount,
        custom_order_id: custom_order_id,
        school_id: createPaymentDto.school_id,
        student_info: createPaymentDto.student_info,
        timestamp: Date.now(),
      };

      // Sign JWT token
      const apiKey = this.configService.get<string>('API_KEY') || 'default-api-key';
      const signedToken = jwt.sign(jwtPayload, apiKey, { expiresIn: '1h' });

      // Return payment response
      return {
        success: true,
        custom_order_id,
        payment_url: `https://payment-gateway.example.com/pay/${custom_order_id}`,
        order_id: savedOrder._id,
        message: 'Payment request created successfully',
        signature: signedToken,
      };

    } catch (error) {
      console.error('Payment creation error:', error);
      throw new InternalServerErrorException('Failed to create payment request');
    }
  }
}
