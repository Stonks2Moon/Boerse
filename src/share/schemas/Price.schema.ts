import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true } })
export class Price extends Document {
  @ApiProperty({
    description: "The share's id this price belongs to",
  })
  @Prop()
  shareId: string;

  @ApiProperty({
    description: 'The value of the given share at the given timestamp',
  })
  @Prop()
  price: number;

  @ApiProperty({
    description: 'The timestamp TODO:',
  })
  @Prop()
  timestamp: number;
}

export const PriceSchema = SchemaFactory.createForClass(Price);
