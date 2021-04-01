import { ApiProperty } from '@nestjs/swagger';

export class PlaceOrderDto {
  @ApiProperty({
    description: 'The id of the share you want to place an order for',
    example: '6037e67c8407c737441517d6',
  })
  shareId: string;

  @ApiProperty({
    description: 'The amount of shares you want to buy or sell',
    example: 1000,
  })
  amount: number;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is placed.',
    example: 'http://request.url.net:8082/webhook/onPlace',
  })
  onPlace: string;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is matched.',
    example: 'http://request.url.net:8082/webhook/onMatch',
  })
  onMatch: string;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is completed.',
    example: 'http://request.url.net:8082/webhook/onComplete',
  })
  onComplete: string;

  @ApiProperty({
    description: 'POST Request URL to notify broker when order is deleted.',
    example: 'http://request.url.net:8082/webhook/onDelete',
  })
  onDelete: string;

  @ApiProperty({
    description: 'Type of order. Specifies if you want to buy or sell.',
    example: 'sell',
    type: 'OrderType',
  })
  type: 'buy' | 'sell';

  @ApiProperty({
    required: false,
    description:
      'Limit of order you want to place. Required for Limit and Stop Limit Order.',
    example: 200,
  })
  limit?: number;

  @ApiProperty({
    required: false,
    description:
      'Stop of order you want to place. Required for Stop Market and Stop Limit Order.',
    example: 180,
  })
  stop?: number;
}
