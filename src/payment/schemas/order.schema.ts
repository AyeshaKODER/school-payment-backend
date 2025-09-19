import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({ type: String, required: true })
  school_id!: string;

  @Prop({ type: String, required: true })
  trustee_id!: string;

  @Prop({
    type: {
      name: { type: String, required: true },
      id: { type: String, required: true },
      email: { type: String, required: true },
    },
    required: true,
  })
  student_info!: {
    name: string;
    id: string;
    email: string;
  };

  @Prop({ required: true })
  gateway_name!: string;

  @Prop({ required: true, unique: true })
  custom_order_id!: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);