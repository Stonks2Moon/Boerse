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
    example: 1000,
  })
  @Prop()
  amount: number;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is placed.',
    example: "ASA there's one",
  })
  @Prop()
  onPlace: string;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is matched.',
    example: "ASA there's one",
  })
  @Prop()
  onMatch: string;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is completed.',
    example: "ASA there's one",
  })
  @Prop()
  onComplete: string;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is deleted.',
    example: "ASA there's one",
  })
  @Prop()
  onDelete: string;

  @ApiProperty({
    description: 'Type of order. Specifies if you want to buy or sell.',
    example: 'sell',
    type: 'OrderType',
  })
  @Prop()
  type: 'buy' | 'sell';

  @ApiProperty({
    required: false,
    description:
      'Limit of order you want to place. Required for Limit and Stop Limit Order.',
  })
  @Prop({ required: false })
  limit?: number;

  @ApiProperty({
    required: false,
    description:
      'Stop of order you want to place. Required for Stop Market and Stop Limit Order.',
  })
  @Prop({
    required: false,
  })
  stop?: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
