import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Clearing extends Document {
  @Prop()
  clearingId: string;

  @Prop()
  shareId: string;

  @Prop()
  timestamp: number;

  @Prop()
  amount: number;

  @Prop()
  price: number;

  @Prop()
  type: 'buy' | 'sell';

  @Prop()
  limit: number;

  @Prop()
  stop?: number;

  @Prop()
  stopLimit?: number;
}

export const ClearingSchema = SchemaFactory.createForClass(Clearing);
