import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../schemas/Order.schema';

export class OrderDeletedDto {
  @ApiProperty({
    description: 'Unique ID of the deleted order',
  })
  orderId: string;

  @ApiProperty({
    description: 'Timestamp of the deleted order',
  })
  timestamp: number;

  @ApiProperty({
    description: 'The remaining amount of shares you wanted to buy or sell',
  })
  remaining: number;

  constructor(order: Order) {
    this.orderId = order._id;
    this.timestamp = new Date().getTime();
    this.remaining = order.amount;
  }
}
