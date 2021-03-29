import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../schemas/Order.schema';

export class OrderMatchedDto {
  @ApiProperty({
    description: 'Unique ID of the matched order',
  })
  orderId: string;

  @ApiProperty({
    description: 'Timestamp of the matched order',
    example: 1615456461931,
  })
  timestamp: number;

  @ApiProperty({
    description: 'The amount of remaining shares after matching',
    example: 200,
  })
  amount: number;

  constructor(order: Order, amount: number) {
    this.orderId = order._id;
    this.timestamp = new Date().getTime();
    this.amount = amount;
  }
}
