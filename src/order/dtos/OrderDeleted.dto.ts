import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../schemas/Order.schema';

export class OrderDeletedDto {
  @ApiProperty({
    description: 'TODO:',
  })
  orderId: string;

  @ApiProperty({
    description: 'TODO:',
  })
  timestamp: number;

  @ApiProperty({
    description: 'TODO:',
  })
  remaining: number;

  constructor(order: Order) {
    this.orderId = order._id;
    this.timestamp = new Date().getTime();
    this.remaining = order.amount;
  }
}
