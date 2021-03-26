import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../schemas/Order.schema';

export class OrderCompletedDto {
  @ApiProperty({
    description: 'Unique ID of the completed order',
  })
  orderId: string;

  @ApiProperty({
    description: 'Timestamp of the completed order',
  })
  timestamp: number;

  constructor(order: Order) {
    this.orderId = order._id;
    this.timestamp = new Date().getTime();
  }
}
