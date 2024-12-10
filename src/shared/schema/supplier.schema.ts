import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Supplier extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  product: string;

  @Prop({ required: false, default: [] })
  categories: string[];

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  contact: string;

  @Prop({
    required: true,
    enum: [0, 1],
    default: 0,
    get: (v: number) => (v === 1 ? 'Taking return' : 'Not taking return'),
    set: (value: string) => (value === 'Taking return' ? 1 : 0),
  })
  takingReturn: number;

  @Prop({ required: false, default: null })
  photoUrl: string | null;

  @Prop({
    required: true,
    default: true,
    get: (v: boolean) => (v ? 'Active' : 'Inactive'),
    set: (value: string) => (value === 'Active' ? true : false),
  })
  active: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
