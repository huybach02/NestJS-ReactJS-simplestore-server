import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { format, toZonedTime } from 'date-fns-tz';

const timeZone = 'Asia/Ho_Chi_Minh';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Voucher extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  code: string;

  @Prop({
    required: true,
    get: (v: Date) =>
      v
        ? format(toZonedTime(v, timeZone), 'yyyy-MM-dd HH:mm:ss', {
            timeZone,
          })
        : null,
  })
  startDate: Date;

  @Prop({
    required: true,
    get: (v: Date) =>
      v
        ? format(toZonedTime(v, timeZone), 'yyyy-MM-dd HH:mm:ss', {
            timeZone,
          })
        : null,
  })
  endDate: Date;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  typeDiscount: string;

  @Prop({ required: true })
  valueDiscount: number;

  @Prop({ required: true })
  minAmountOfOrder: number;

  @Prop({ required: true })
  maxDiscount: number;

  @Prop({ required: true })
  maxUser: number;

  @Prop({ required: true })
  numberOfUsesPerUser: number;

  @Prop({ required: false, default: 0 })
  usedCount: number;

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

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
