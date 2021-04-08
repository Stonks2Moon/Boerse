import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
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
    description: 'Amount of the shares. 0 < amount ≤ 100000',
    example: 1000,
    minimum: 0.01,
    maximum: 100000,
  })
  @Prop()
  amount: number;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is placed.',
    example: 'http://request.url.net:8082/webhook/onPlace',
  })
  @Prop()
  onPlace: string;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is matched.',
    example: 'http://request.url.net:8082/webhook/onMatch',
  })
  @Prop()
  onMatch: string;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is completed.',
    example: 'http://request.url.net:8082/webhook/onComplete',
  })
  @Prop()
  onComplete: string;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is deleted.',
    example: 'http://request.url.net:8082/webhook/onDelete',
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
      'Limit of order you want to place. Required for Limit and Stop Limit Order. Maximum 2 decimal places allowed.',
    example: 200,
  })
  @Prop({ required: false })
  limit?: number;

  @ApiProperty({
    required: false,
    description:
      'Stop of order you want to place. Required for Stop Market and Stop Limit Order. Maximum 2 decimal places allowed.',
    example: 200,
  })
  @Prop({ required: false })
  stop?: number;

  @ApiHideProperty()
  @Prop({ required: false })
  market?: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
