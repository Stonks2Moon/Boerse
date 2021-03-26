import { ApiProperty } from '@nestjs/swagger';

export class CreateShareDto {
  @ApiProperty({
    description: 'Display color for texts or anything else',
  })
  color: string;

  @ApiProperty({
    description: "The share's displayname",
    example: 'Mondgestein',
  })
  name: string;

  @ApiProperty({
    description: "The share's current value",
    example: 150,
  })
  price: number;

  @ApiProperty({
    description: 'Thumbnail of the assets (e.g. coin)',
  })
  thumbnail: string;
}
