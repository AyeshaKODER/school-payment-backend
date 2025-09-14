import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

  // ---------------- CREATE PAYMENT ---------------- //
  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      const { order_amount, school_id } = createPaymentDto;

      // Generate custom order id
      const custom_order_id = `ORD_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 11)}`;

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
        payment_mode: createPaymentDto.payment_mode!,
        payment_details: 'Pending',
        bank_reference: 'PENDING',
        payment_message: 'Payment initiated',
        status: 'pending',
        error_message: 'NA',
        payment_time: new Date(),
      });
      await orderStatus.save();

      // Prepare JWT sign using PG Secret Key
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

      // Build request payload for payment gateway
      const paymentGatewayPayload = {
        school_id,
        amount: order_amount,
        callback_url: this.configService.get<string>('CALLBACK_URL'),
        sign,
      };

      const paymentApiUrl = this.configService.get<string>('PAYMENT_API_URL');
      const apiKey = this.configService.get<string>('PAYMENT_API_KEY');

      const response = await firstValueFrom<AxiosResponse<{
        collect_request_id: string;
        Collect_request_url: string;
      }>>(
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
    } catch (err: unknown) {
      const error =
        err && typeof err === 'object' && 'response' in err
          ? (err as any).response?.data
          : err;
      console.error('Payment creation error:', error);
      throw new InternalServerErrorException(
        'Failed to create payment request',
      );
    }
  }

  // ---------------- CHECK PAYMENT STATUS ---------------- //
  async checkPaymentStatus(orderId: string) {
    try {
      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const paymentApiUrl = this.configService.get<string>('PAYMENT_API_URL');
      const apiKey = this.configService.get<string>('PAYMENT_API_KEY');

      const response = await firstValueFrom(
        this.httpService.get(`${paymentApiUrl}/collect-request/${order.custom_order_id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        }),
      );

      // Update order status in DB
      await this.orderStatusModel.updateOne(
        { collect_id: order._id },
        {
          $set: {
            status: response.data.status,
            payment_details: response.data.payment_details || 'N/A',
            payment_message: response.data.message || 'Updated',
            bank_reference: response.data.bank_reference || 'N/A',
            payment_time: new Date(),
          },
        },
      );

      return response.data;
    } catch (err: unknown) {
      const error =
        err && typeof err === 'object' && 'response' in err
          ? (err as any).response?.data
          : err;
      console.error('Check payment status error:', error);
      throw new InternalServerErrorException('Failed to check payment status');
    }
  }

  // ---------------- HANDLE WEBHOOK ---------------- //
  async handleWebhook(payload: Record<string, any>) {
    try {
      const { collect_request_id, status, bank_reference, message } = payload;

      // Find order by custom_order_id
      const order = await this.orderModel.findOne({
        custom_order_id: collect_request_id,
      });
      if (!order) {
        throw new NotFoundException('Order not found for webhook');
      }

      // Update order status
      await this.orderStatusModel.updateOne(
        { collect_id: order._id },
        {
          $set: {
            status,
            bank_reference: bank_reference || 'N/A',
            payment_message: message || 'Updated via webhook',
            payment_time: new Date(),
          },
        },
      );

      return { success: true, message: 'Webhook processed' };
    } catch (err: unknown) {
      const error =
        err && typeof err === 'object' && 'response' in err
          ? (err as any).response?.data
          : err;
      console.error('Webhook handling error:', error);
      throw new InternalServerErrorException('Failed to process webhook');
    }
  }
}
