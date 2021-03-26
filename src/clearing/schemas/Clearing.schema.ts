import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true } })
export class Clearing extends Document {
  @ApiProperty({
    description: 'ID of the broker who placed order',
  })
  @Prop()
  brokerId: string;

  @ApiProperty({
    description: 'ID of the share',
  })
  @Prop()
  shareId: string;

  @ApiProperty({
    description: 'Timestamp of the order',
  })
  @Prop()
  timestamp: number;

  @ApiProperty({
    description: 'Amount of the shares',
  })
  @Prop()
  amount: number;

  @ApiProperty({
    description: 'Price of share that got traded',
  })
  @Prop()
  price: number;

  @ApiProperty({
    description: 'Type of order. Specifies if bought or sold.',
  })
  @Prop()
  type: 'buy' | 'sell';

  @ApiProperty({
    description: 'Limit of order. Required for Limit and Stop Limit Order.',
  })
  @Prop({ required: false })
  limit?: number;

  @ApiProperty({
    required: false,
    description:
      'Stop of order you want to place. Required for Stop Market and Stop Limit Order.',
  })
  @Prop({ required: false })
  stop?: number;
}

export const ClearingSchema = SchemaFactory.createForClass(Clearing);
