import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username!: string;  // <-- added !

  @Prop({ required: true, unique: true })
  email!: string;     // <-- added !

  @Prop({ required: true })
  password!: string;  // <-- added !

  @Prop({ default: 'user' })
  role!: string;      // <-- added !

  @Prop({ default: true })
  isActive!: boolean; // <-- added !
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create indexes
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
