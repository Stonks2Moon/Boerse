import { ApiProperty } from '@nestjs/swagger';

export class CreateShareDto {
  @ApiProperty({
    description: 'Display color for texts or anything else',
    example: '#b9050b',
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
    example:
      'https://timos.s3.eu-central-1.amazonaws.com/moonstonks/MarsCoin.webp',
  })
  thumbnail: string;
}
