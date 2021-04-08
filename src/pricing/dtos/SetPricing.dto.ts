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
  })
  entries: PricingEntry[];
}
