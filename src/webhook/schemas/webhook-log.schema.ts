import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookLogDocument = WebhookLog & Document;

@Schema({ collection: 'webhook_logs', timestamps: true })
export class WebhookLog {
  @Prop({ required: true })
  webhook_id!: string; // <-- added !

  @Prop({ required: true })
  event_type!: string; // <-- added !

  @Prop({ type: Object, required: true })
  payload!: any; // <-- added !

  @Prop({ required: true, default: 'received' })
  status!: string; // <-- added !

  @Prop()
  error_message?: string; // optional, no changes needed

  @Prop({ required: true })
  processed_at!: Date; // <-- added !
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);

// Create indexes
WebhookLogSchema.index({ webhook_id: 1 });
WebhookLogSchema.index({ event_type: 1 });
WebhookLogSchema.index({ processed_at: -1 });
