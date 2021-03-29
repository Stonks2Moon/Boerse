import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true } })
export class Clearing extends Document {
  @ApiProperty({
    description: 'ID of the broker who placed order',
    example: 'brokerID',
  })
  @Prop()
  brokerId: string;

  @ApiProperty({
    description: 'ID of the share',
    example: '6046b43b6008b9436c4f458d',
  })
  @Prop()
  shareId: string;

  @ApiProperty({
    description: 'Timestamp of the order',
    example: 1615456461931,
  })
  @Prop()
  timestamp: number;

  @ApiProperty({
    description: 'Amount of the shares',
    example: 1000,
  })
  @Prop()
  amount: number;

  @ApiProperty({
    description: 'Price of share that got traded',
    example: 230,
  })
  @Prop()
  price: number;

  @ApiProperty({
    description: 'Type of order. Specifies if bought or sold.',
    example: 'buy',
  })
  @Prop()
  type: 'buy' | 'sell';

  @ApiProperty({
    description: 'Limit of order. Required for Limit and Stop Limit Order.',
    example: 200,
  })
  @Prop({ required: false })
  limit?: number;

  @ApiProperty({
    required: false,
    description:
      'Stop of order you want to place. Required for Stop Market and Stop Limit Order.',
    example: 200,
  })
  @Prop({ required: false })
  stop?: number;
}

export const ClearingSchema = SchemaFactory.createForClass(Clearing);
