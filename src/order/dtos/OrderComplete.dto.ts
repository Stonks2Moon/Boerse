import { ApiProperty } from '@nestjs/swagger';

export class OrderCompleteDto {
  @ApiProperty({
    description: 'TODO:',
  })
  orderId: string;

  @ApiProperty({
    description: 'TODO:',
  })
  timestamp: number;
}
