import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true } })
export class Order extends Document {
  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  brokerId: string;

  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  shareId: string;

  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  timestamp: number;

  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  amount: number;

  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  onMatch: string;

  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  onComplete: string;

  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  type: 'buy' | 'sell';

  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  limit: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  stop?: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  stopLimit?: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
