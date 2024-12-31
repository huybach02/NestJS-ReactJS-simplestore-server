import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Product } from './product.schema';
import { Voucher } from './voucher';

interface CartProduct {
  id: string;
  product: any;
  hasVariant: boolean;
  buyQuantity: number;
  variant: any;
  size: string;
}

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Order extends Document {
  @Prop({
    required: false,
    default: '#' + new Date().getTime() + Math.floor(Math.random() * 1000),
  })
  invoiceId: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: false,
    default: [],
    type: [
      {
        id: String,
        product: { type: mongoose.Schema.Types.Mixed },
        hasVariant: Boolean,
        buyQuantity: Number,
        variant: { type: mongoose.Schema.Types.Mixed },
        size: String,
      },
    ],
  })
  products: CartProduct[];

  @Prop({ required: false, default: null, type: mongoose.Schema.Types.Mixed })
  voucher: any | null;

  @Prop({ required: true })
  subTotal: number;

  @Prop({ required: false, default: 0 })
  discount: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: false, default: null, type: mongoose.Schema.Types.Mixed })
  address: {
    receiver: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    address: string;
    note?: string | null;
  };

  @Prop({ required: true, enum: ['cod', 'paypal'] })
  paymentMethod: string;

  @Prop({ required: true, enum: ['success', 'pending', 'failed'] })
  paymentStatus: string;

  @Prop({
    required: true,
    enum: ['confirmed', 'processing', 'shipping', 'completed', 'cancelled'],
    default: 'confirmed',
  })
  orderStatus: string;

  @Prop({
    required: true,
    default: function () {
      return new Date(
        Date.now() +
          (Math.floor(Math.random() * (10 - 3 + 1)) + 3) * 24 * 60 * 60 * 1000,
      );
    },
  })
  estimatedDeliveryDate: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
