import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_doc: Order, ret: Order) => {
      delete ret._id;
      delete ret.__v;
      delete ret.onPlace;
      delete ret.onMatch;
      delete ret.onComplete;
      delete ret.onDelete;
      delete ret.brokerId;
      return ret;
    },
  },
})
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
  onPlace: string;

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
  onDelete: string;

  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  type: 'buy' | 'sell';

  @ApiProperty({
    required: false,
    description: 'TODO:',
  })
  @Prop({ required: false })
  limit?: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  stop?: number;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  stopLimit?: number;

  @Prop({ required: false })
  stopTriggered?: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
