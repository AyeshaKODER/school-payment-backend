import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document & { createdAt: Date; updatedAt: Date };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: 'user' })
  role!: string;

  @Prop({ default: true })
  isActive!: boolean;
  
  _id!: Types.ObjectId; // 👈 explicitly declare _id type
}

export const UserSchema = SchemaFactory.createForClass(User);
