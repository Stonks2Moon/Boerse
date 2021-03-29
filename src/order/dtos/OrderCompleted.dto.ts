import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../schemas/Order.schema';

export class OrderCompletedDto {
  @ApiProperty({
    description: 'Unique ID of the completed order',
  })
  orderId: string;

  @ApiProperty({
    description: 'Timestamp of the completed order',
    example: 1615456461931,
  })
  timestamp: number;

  constructor(order: Order) {
    this.orderId = order._id;
    this.timestamp = new Date().getTime();
  }
}
