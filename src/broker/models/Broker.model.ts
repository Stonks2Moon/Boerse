import { ApiProperty } from '@nestjs/swagger';

export class BrokerModel {
  @ApiProperty({
    description: 'Unique ID of broker',
    example: 'brokerID',
  })
  id: string;

  @ApiProperty({
    description: 'Type of broker. Important for clearing and access rights',
    type: 'BrokerType',
    example: 'private',
  })
  type:
    | 'private'
    | 'business'
    | 'simulation'
    | 'stockmarket'
    | 'liquiditydonor';

  @ApiProperty({
    description: 'Internal displayName for an specific broker',
    example: 'Coinbase',
  })
  displayName: string;

  @ApiProperty({
    description: 'Determines if broker is banned',
  })
  banned?: boolean;
}
