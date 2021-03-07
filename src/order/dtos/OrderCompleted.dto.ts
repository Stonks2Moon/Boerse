import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../schemas/Order.schema';

export class OrderCompletedDto {
  @ApiProperty({
    description: 'TODO:',
  })
  orderId: string;

  @ApiProperty({
    description: 'TODO:',
  })
  timestamp: number;

  constructor(order: Order) {
    this.orderId = order._id;
    this.timestamp = new Date().getTime();
  }
}
