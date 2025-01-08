import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Review extends Document {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  })
  productId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  review: string;

  @Prop({ required: false, default: [] })
  images: string[];

  @Prop({ required: false, default: true })
  active: boolean;

  @Prop({ required: false })
  replyByAdmin: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
