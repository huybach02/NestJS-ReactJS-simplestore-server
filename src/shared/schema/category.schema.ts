import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false })
  parentId: Types.ObjectId;

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

export const CategorySchema = SchemaFactory.createForClass(Category);
