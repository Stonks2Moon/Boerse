import { ApiProperty } from '@nestjs/swagger';

export class DeleteOrderDto {
  @ApiProperty({
    description: 'Unique ID of the order you want to delete',
  })
  orderId: string;
}
