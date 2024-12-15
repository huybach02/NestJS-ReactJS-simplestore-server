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
  contact: string;

  @Prop({
    required: true,
    enum: [0, 1],
    default: 0,
  })
  takingReturn: number;

  @Prop({ required: false, default: null })
  photoUrl: string | null;

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

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
