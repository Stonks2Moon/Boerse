import { ApiProperty } from '@nestjs/swagger';

export class OrderMatchDto {
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
}
