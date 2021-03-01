import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true } })
export class Clearing extends Document {
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
  price: number;

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

  @ApiProperty({
    required: false,
    description: 'TODO:',
  })
  @Prop({ required: false })
  stop?: number;

  @ApiProperty({
    required: false,
    description: 'TODO:',
  })
  @Prop({ required: false })
  stopLimit?: number;
}

export const ClearingSchema = SchemaFactory.createForClass(Clearing);
