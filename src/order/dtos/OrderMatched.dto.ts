import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../schemas/Order.schema';

export class OrderMatchedDto {
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
  amount: number;

  constructor(order: Order, amount: number) {
    this.orderId = order._id;
    this.timestamp = new Date().getTime();
    this.amount = amount;
  }
}
