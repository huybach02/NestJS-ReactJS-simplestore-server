import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { format, toZonedTime } from 'date-fns-tz';
import { Product } from './product.schema';

const timeZone = 'Asia/Ho_Chi_Minh';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class ProductVariant extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId | Product;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: [] })
  sizes: string[];

  @Prop({ required: false, default: null, nullable: true })
  originalPrice: number | null;

  @Prop({
    required: true,
    default: false,
  })
  hasSale: boolean;

  @Prop({
    required: false,
    enum: ['percentage', 'fixed'],
    nullable: true,
  })
  typeSale: string | null;

  @Prop({ required: false, default: null, nullable: true })
  saleValue: number | null;

  @Prop({ required: false, default: null, nullable: true })
  salePrice: number | null;

  @Prop({
    required: false,
    default: null,
    nullable: true,
    get: (v: Date) =>
      v
        ? format(toZonedTime(v, timeZone), 'yyyy-MM-dd HH:mm:ssXXX', {
            timeZone,
          })
        : null,
  })
  saleStartDate: Date | null;

  @Prop({
    required: false,
    default: null,
    nullable: true,
    get: (v: Date) =>
      v
        ? format(toZonedTime(v, timeZone), 'yyyy-MM-dd HH:mm:ssXXX', {
            timeZone,
          })
        : null,
  })
  saleEndDate: Date | null;

  @Prop({ required: false, default: null, nullable: true })
  quantity: number | null;

  @Prop({ required: false, default: null, nullable: true })
  thumbnail: string | null;

  @Prop({
    required: true,
    default: true,
  })
  active: boolean;

  @Prop({ required: false, default: false })
  isDeleted: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);
