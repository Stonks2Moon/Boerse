import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({
  toJSON: {
    virtuals: true,
    transform: (_doc: DailyClearing, ret: DailyClearing) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class DailyClearing extends Document {
  @Prop()
  brokerId: string;

  @Prop()
  orderAmount: number;

  @Prop()
  volumeBuy: number;

  @Prop()
  volumeSell: number;

  @Prop()
  transactionPrice: number;

  @Prop()
  day: number;

  @Prop()
  month: number;

  @Prop()
  year: number;

  @Prop()
  tradePrice: number;

  @Prop()
  fixum: number;
}

export const DailyClearingSchema = SchemaFactory.createForClass(DailyClearing);
