import { ApiProperty } from '@nestjs/swagger';
import { PricingEntry } from '../models/PricingEntry.model';

export class SetPricingDto {
  @ApiProperty({
    description: 'Type of broker',
    example: 'business',
  })
  type: string;

  @ApiProperty({
    description: 'Entries for pricing table',
    type: 'PricingEntry',
    example: [
      {
        changeoverLimit: 15000,
        fixum: 0,
        tradePromille: 0.35,
        tradeMin: 21,
        tradeMax: 52.5,
        transactionMin: 0.5,
        transactionMax: 97.5,
        transactionPromille: 0.65,
      },
    ],
  })
  entries: PricingEntry[];
}
