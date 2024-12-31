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
export class CartTemp extends Document {
  @Prop({ required: true })
  userId: string;

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

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CartTempSchema = SchemaFactory.createForClass(CartTemp);
