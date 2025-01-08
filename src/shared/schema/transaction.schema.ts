import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Transaction extends Document {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  orderId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ required: true })
  paymentStatus: string;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  facilitatorAccessToken: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
