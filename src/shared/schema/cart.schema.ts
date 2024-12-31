import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProductVariant } from './productVariant.schema';
import { Product } from './product.schema';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Cart extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: false, default: [] })
  products: {
    id: string;
    productId: Types.ObjectId | Product;
    buyQuantity: number;
    hasVariant: boolean;
    variant: {
      variantId: Types.ObjectId | ProductVariant;
      size: string | null;
    } | null;
  }[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.pre('find', function () {
  this.populate({
    path: 'products.productId',
    model: 'Product',
  }).populate({
    path: 'products.variant.variantId',
    model: 'ProductVariant',
  });
});

CartSchema.pre('findOne', function () {
  this.populate({
    path: 'products.productId',
    model: 'Product',
  }).populate({
    path: 'products.variant.variantId',
    model: 'ProductVariant',
  });
});
