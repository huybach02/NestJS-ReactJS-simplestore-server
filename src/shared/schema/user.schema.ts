import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role: string;

  @Prop({ required: false, default: null })
  avatar: string;

  @Prop({ required: false, default: null })
  phone: string;

  @Prop({ required: false, default: 'manual' })
  accountType: string;

  @Prop({ required: false, default: null, select: false })
  refreshToken: string;

  @Prop({ required: false, default: false })
  isVerified: boolean;

  @Prop({ required: false, default: null })
  otp: string;

  @Prop({ required: false, default: null })
  otpExpired: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
