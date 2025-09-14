import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, required: true })
  school_id!: Types.ObjectId;  // <-- added !

  @Prop({ type: Types.ObjectId, required: true })
  trustee_id!: Types.ObjectId; // <-- added !

  @Prop({
    type: {
      name: { type: String, required: true },
      id: { type: String, required: true },
      email: { type: String, required: true },
    },
    required: true,
  })
  student_info!: {              // <-- added !
    name: string;
    id: string;
    email: string;
  };

  @Prop({ required: true })
  gateway_name!: string;         // <-- added !

  @Prop({ required: true, unique: true })
  custom_order_id!: string;      // <-- added !
}

// ✅ Export schema correctly
export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes for performance
OrderSchema.index({ school_id: 1 });
OrderSchema.index({ custom_order_id: 1 });
OrderSchema.index({ 'student_info.id': 1 });
