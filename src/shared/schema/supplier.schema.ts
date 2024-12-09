import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
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

  @Prop({ required: true, enum: [0, 1], default: 0 })
  isTaking: number;

  @Prop({ required: false, default: null })
  photoUrl: string | null;

  @Prop({ required: true, default: true })
  active: boolean;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
