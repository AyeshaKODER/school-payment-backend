import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { AxiosResponse } from 'axios';

import { Order, OrderDocument } from './schemas/order.schema';
import {
  OrderStatus,
  OrderStatusDocument,
} from '../transaction/schemas/order-status.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name)
    private orderStatusModel: Model<OrderStatusDocument>,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      const { order_amount, school_id, student_info } = createPaymentDto;

      // Generate custom order id
      const custom_order_id = `ORD_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Save order locally
      const order = new this.orderModel({
        ...createPaymentDto,
        custom_order_id,
      });
      const savedOrder = await order.save();

      // Create initial order status
      const orderStatus = new this.orderStatusModel({
        collect_id: savedOrder._id,
        order_amount,
        transaction_amount: order_amount,
        payment_mode: createPaymentDto.payment_mode,
        payment_details: 'Pending',
        bank_reference: 'PENDING',
        payment_message: 'Payment initiated',
        status: 'pending',
        error_message: 'NA',
        payment_time: new Date(),
      });
      await orderStatus.save();

      // ✅ Prepare JWT sign using PG Secret Key
      const pgKey = this.configService.get<string>('PAYMENT_PG_KEY');
      if (!pgKey) {
        throw new InternalServerErrorException(
          'PAYMENT_PG_KEY not configured in .env',
        );
      }

      const jwtPayload = {
        school_id,
        amount: order_amount,
        callback_url: this.configService.get<string>('CALLBACK_URL'),
      };

      const sign = jwt.sign(jwtPayload, pgKey, { expiresIn: '5m' });

      // ✅ Build request payload for Edviron
      const paymentGatewayPayload = {
        school_id,
        amount: order_amount,
        callback_url: this.configService.get<string>('CALLBACK_URL'),
        sign,
      };

      // Call Edviron API
      const paymentApiUrl = this.configService.get<string>('PAYMENT_API_URL');
      const apiKey = this.configService.get<string>('PAYMENT_API_KEY');

      const response = await firstValueFrom<
        AxiosResponse<{
          collect_request_id: string;
          Collect_request_url: string;
        }>
      >(
        this.httpService.post(
          `${paymentApiUrl}/create-collect-request`,
          paymentGatewayPayload,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return {
        success: true,
        custom_order_id,
        collect_request_id: response.data.collect_request_id,
        payment_url: response.data.Collect_request_url,
        order_id: savedOrder._id,
        message: 'Payment request created successfully',
      };
    } catch (error) {
      console.error('Payment creation error:', error);
      throw new InternalServerErrorException(
        'Failed to create payment request',
      );
    }
  }
}
