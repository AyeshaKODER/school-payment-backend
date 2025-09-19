import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderStatusDocument = OrderStatus & Document;

@Schema({ collection: 'order_status', timestamps: true })
export class OrderStatus {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  collect_id!: Types.ObjectId;

  @Prop({ required: true })
  order_amount!: number;

  @Prop({ required: true })
  transaction_amount!: number;

  @Prop({ required: true })
  payment_mode!: string;

  @Prop({ required: true })
  payment_details!: string;

  @Prop({ required: true })
  bank_reference!: string;

  @Prop({ required: true })
  payment_message!: string;

  @Prop({ required: true, enum: ['pending', 'success', 'failed', 'processing'] })
  status!: string;

  @Prop({ default: 'NA' })
  error_message!: string;

  @Prop({ required: true })
  payment_time!: Date;
}

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);