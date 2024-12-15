import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { format, toZonedTime } from 'date-fns-tz';
import { Supplier } from './supplier.schema';
import { Category } from './category.schema';

const timeZone = 'Asia/Ho_Chi_Minh';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true })
  supplier: Types.ObjectId | Supplier;

  @Prop({ required: true })
  originalPrice: number;

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

  @Prop({ required: true })
  quantity: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: false,
    nullable: true,
  })
  category: Types.ObjectId | Category | null;

  @Prop({
    required: true,
    enum: [0, 1],
    default: 0,
  })
  takingReturn: number;

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ required: false, default: [] })
  photoUrls: string[];

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    default: true,
  })
  active: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
