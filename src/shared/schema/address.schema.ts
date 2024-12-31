import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Address extends Document {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  receiver: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  province: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  ward: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: false })
  note: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
