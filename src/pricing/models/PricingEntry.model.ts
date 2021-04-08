import { ApiProperty } from '@nestjs/swagger';

export class PricingEntry {
  @ApiProperty({
    description: 'Pricing Entry Limit in volume (price*amount)',
    example: '2500',
  })
  changeoverLimit: number;

  @ApiProperty({
    description:
      'Fixed value (netto) that has to be paid for this pricing entry',
    example: '0.30',
  })
  fixum: number;

  @ApiProperty({
    description: 'Transaction fee in promille',
    example: '0.75',
  })
  transactionPromille: number;

  @ApiProperty({
    description: 'Minimum absolute transaction fee',
    example: '1.50',
  })
  transactionMin: number;
  @ApiProperty({
    description: 'Maximum absolute transaction fee',
    example: '1.88',
  })
  transactionMax: number;

  @ApiProperty({
    description: 'Trading fee in promille',
    example: '0.52',
  })
  tradePromille: number;

  @ApiProperty({
    description: 'Minimum absolute trading fee',
    example: '0.50',
  })
  tradeMin: number;

  @ApiProperty({
    description: 'Maximum absolute trading fee',
    example: '1.30',
  })
  tradeMax: number;
}
