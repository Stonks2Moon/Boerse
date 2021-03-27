import { ApiProperty } from '@nestjs/swagger';

export class BrokerModel {
  @ApiProperty({
    description: 'Token of broker, to identify and authenticate.',
  })
  id: string;

  @ApiProperty({
    description: 'Type of broker. Important for clearing and access rights',
    type: 'BrokerType',
  })
  type: 'private' | 'business' | 'simulation' | 'stockmarket';

  @ApiProperty({
    description: 'Internal displayName for an specific broker',
  })
  displayName: string;

  @ApiProperty({
    description: 'Determines if broker is banned',
  })
  banned?: boolean;
}
