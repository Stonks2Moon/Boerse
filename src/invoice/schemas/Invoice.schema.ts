import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true } })
export class Invoice extends Document {
  @Prop()
  brokerId: string;

  @Prop()
  timestamp: number;

  @Prop()
  payed: boolean;

  @Prop()
  amount: number;

  @Prop({ required: false })
  description?: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
