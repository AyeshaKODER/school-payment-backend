import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';

import { Order, OrderDocument } from '../payment/schemas/order.schema';
import {
  OrderStatus,
  OrderStatusDocument,
} from './schemas/order-status.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name)
    private orderStatusModel: Model<OrderStatusDocument>,
  ) {}

  async getAllTransactions(
    page: number = 1,
    limit: number = 10,
    sort?: string,
    order?: string,
    status?: string,
    schoolId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const skip = (page - 1) * limit;

    // Build match conditions
    const matchConditions: any = {};
    if (status) {
      matchConditions['orderStatus.status'] = status;
    }
    if (schoolId) {
      matchConditions.school_id = schoolId;
    }
    if (dateFrom || dateTo) {
      matchConditions['orderStatus.payment_time'] = {};
      if (dateFrom) {
        matchConditions['orderStatus.payment_time'].$gte = new Date(dateFrom);
      }
      if (dateTo) {
        matchConditions['orderStatus.payment_time'].$lte = new Date(dateTo);
      }
    }

    // Build sort options
    const sortOptions: any = {};
    if (sort) {
      const sortField = sort.startsWith('orderStatus.')
        ? sort
        : `orderStatus.${sort}`;
      sortOptions[sortField] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions['orderStatus.payment_time'] = -1; // Default sort by payment_time desc
    }

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'order_status',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'orderStatus',
        },
      },
      {
        $unwind: '$orderStatus',
      },
      ...(Object.keys(matchConditions).length > 0
        ? [{ $match: matchConditions }]
        : []),
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$orderStatus.order_amount',
          transaction_amount: '$orderStatus.transaction_amount',
          status: '$orderStatus.status',
          custom_order_id: 1,
          student_info: 1,
          payment_time: '$orderStatus.payment_time',
          payment_mode: '$orderStatus.payment_mode',
          bank_reference: '$orderStatus.bank_reference',
        },
      },
      {
        $sort: sortOptions,
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const result = await this.orderModel.aggregate(pipeline);
    const transactions = result[0].data;
    const total = result[0].total[0]?.count || 0;

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionsBySchool(
    schoolId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      {
        $match: { school_id: schoolId },
      },
      {
        $lookup: {
          from: 'order_status',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'orderStatus',
        },
      },
      {
        $unwind: '$orderStatus',
      },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: '$orderStatus.order_amount',
          transaction_amount: '$orderStatus.transaction_amount',
          status: '$orderStatus.status',
          custom_order_id: 1,
          student_info: 1,
          payment_time: '$orderStatus.payment_time',
          payment_mode: '$orderStatus.payment_mode',
          bank_reference: '$orderStatus.bank_reference',
        },
      },
      {
        $sort: { payment_time: -1 },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const result = await this.orderModel.aggregate(pipeline);
    const transactions = result[0].data;
    const total = result[0].total[0]?.count || 0;

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

async getTransactionStatus(customOrderId: string) {
  // Find the order first by custom_order_id
  const order = await this.orderModel.findOne({
    custom_order_id: customOrderId,
  });

  if (!order) {
    throw new NotFoundException({
      message: 'Transaction not found',
      error: 'Not Found',
      statusCode: 404,
    });
  }

  // Find the corresponding order status using collect_id
  const orderStatus = await this.orderStatusModel.findOne({
    collect_id: order._id,
  });

  if (!orderStatus) {
    throw new NotFoundException({
      message: 'Transaction status not found',
      error: 'Not Found',
      statusCode: 404,
    });
  }

  // Return safely with TypeScript null-safety
  return {
    custom_order_id: customOrderId,
    collect_id: order._id,
    status: orderStatus.status,
    order_amount: orderStatus.order_amount,
    transaction_amount: orderStatus.transaction_amount,
    payment_mode: orderStatus.payment_mode,
    payment_time: orderStatus.payment_time,
    payment_message: orderStatus.payment_message,
    bank_reference: orderStatus.bank_reference,
    student_info: order.student_info, // order is guaranteed to exist here
  };
}

}
