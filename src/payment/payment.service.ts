import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
    private configService: ConfigService,
    private httpService: HttpService,
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
      const apiKey = this.configService.get<string>('API_KEY');
      const signedToken = jwt.sign(jwtPayload, apiKey, { expiresIn: '1h' });

      // Prepare payment gateway request
      const paymentGatewayPayload = {
        pg_key: this.configService.get<string>('PG_KEY'),
        order_id: custom_order_id,
        order_amount: createPaymentDto.order_amount,
        student_info: createPaymentDto.student_info,
        gateway_name: createPaymentDto.gateway_name,
        payment_mode: createPaymentDto.payment_mode,
        signature: signedToken,
      };

      // Call payment gateway API (create-collect-request)
      // Note: Replace with actual payment gateway URL
      const paymentApiUrl = this.configService.get<string>('PAYMENT_API_URL') || 'https://api.example.com';
      
      try {
        const response = await firstValueFrom(
          this.httpService.post(`${paymentApiUrl}/create-collect-request`, paymentGatewayPayload, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          })
        );

        // Return the payment page URL from the response
        return {
          success: true,
          custom_order_id,
          payment_url: response.data.payment_url || `${paymentApiUrl}/payment/${custom_order_id}`,
          order_id: savedOrder._id,
          message: 'Payment request created successfully',
        };