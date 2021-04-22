import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_doc: Invoice, ret: Invoice) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Invoice extends Document {
  @Prop()
  brokerId: string;

  @Prop()
  timestamp: number;

  @Prop()
  month: number;

  @Prop()
  year: number;

  @Prop()
  payed: boolean;

  @Prop()
  amount: number;

  @Prop({ required: false })
  description?: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
