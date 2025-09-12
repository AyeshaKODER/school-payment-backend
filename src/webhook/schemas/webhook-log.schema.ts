import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookLogDocument = WebhookLog & Document;

@Schema({ collection: 'webhook_logs', timestamps: true })
export class WebhookLog {
  @Prop({ required: true })
  webhook_id: string;

  @Prop({ required: true })
  event_type: string;

  @Prop({ type: Object, required: true })
  payload: any;

  @Prop({ required: true, default: 'received' })
  status: string;

  @Prop()
  error_message?: string;

  @Prop({ required: true })
  processed_at: Date;
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);

// Create indexes
WebhookLogSchema.index({ webhook_id: 1 });
WebhookLogSchema.index({ event_type: 1 });
WebhookLogSchema.index({ processed_at: -1 });
