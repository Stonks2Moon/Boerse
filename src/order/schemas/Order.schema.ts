import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Order extends Document {
  @Prop()
  brokerId: string;

  @Prop()
  shareId: string;

  @Prop()
  timestamp: number;

  @Prop()
  amount: number;

  @Prop()
  callback: string;

  @Prop()
  type: 'buy' | 'sell';

  @Prop()
  limit: number;

  @Prop({ required: false })
  stop?: number;

  @Prop({ required: false })
  stopLimit?: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
