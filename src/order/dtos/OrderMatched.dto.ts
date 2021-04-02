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

  @ApiProperty({
    description: 'The price for which the order has been executed',
    example: 420,
  })
  price: number;

  constructor(order: Order, amount: number, price: number) {
    this.orderId = order._id;
    this.timestamp = Date.now();
    this.amount = amount;
    this.price = price;
  }
}
