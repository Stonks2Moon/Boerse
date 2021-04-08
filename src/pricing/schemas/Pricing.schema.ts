import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { PricingEntry } from '../models/PricingEntry.model';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_doc: Pricing, ret: Pricing) => {
      delete ret._id;
      delete ret.id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Pricing extends Document {
  @ApiProperty({
    description: 'Type of broker',
    example: 'business',
  })
  @Prop()
  type: string;

  @ApiProperty({
    description: 'Entries for pricing table',
    type: 'PricingEntry',
  })
  @Prop()
  entries: PricingEntry[];
}

export const PricingSchema = SchemaFactory.createForClass(Pricing);
