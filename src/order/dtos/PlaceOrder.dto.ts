import { ApiProperty } from '@nestjs/swagger';

export class PlaceOrderDto {
  @ApiProperty({
    description: 'The id of the share you want to place an order for',
  })
  shareId: string;

  @ApiProperty({
    description: 'The amount of shares you want to buy or sell',
    example: 1000,
  })
  amount: number;

  @ApiProperty({
    description: 'TODO:',
    example: "ASA there's one",
  })
  onMatch: string;

  @ApiProperty({
    description: 'TODO:',
    example: "ASA there's one",
  })
  onComplete: string;

  @ApiProperty({
    description: 'TODO:',
    example: 'sell',
    type: 'OrderType',
  })
  type: 'buy' | 'sell';

  @ApiProperty({
    required: false,
    description: 'TODO:',
    example: 200,
  })
  limit?: number;

  @ApiProperty({
    required: false,
    description: 'TODO:',
  })
  stop?: number;

  @ApiProperty({
    required: false,
    description: 'TODO:',
  })
  stopLimit?: number;
}
