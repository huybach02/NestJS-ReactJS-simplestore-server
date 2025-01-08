import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Wishlist extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Product' })
  productId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
