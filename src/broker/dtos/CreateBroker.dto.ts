import { ApiProperty } from '@nestjs/swagger';

export class CreateBrokerDto {
  @ApiProperty({
    description: 'Type of broker. Important for clearing and access rights',
    type: 'BrokerType',
    example: 'business',
  })
  type: 'private' | 'business' | 'simulation';

  @ApiProperty({
    description: 'Internal displayName for an specific broker',
    example: 'Coinbase',
  })
  displayName: string;
}
