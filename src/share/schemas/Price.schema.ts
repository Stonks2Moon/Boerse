import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({
  toJSON: {
    transform: (_doc: Price, ret: Price) => {
      delete ret._id;
      delete ret.shareId;
      delete ret.__v;
      return ret;
    },
  },
})
export class Price extends Document {
  @ApiProperty({
    description: "The share's id this price belongs to",
    example: '6046b43b6008b9436c4f458d',
  })
  @Prop()
  shareId: string;

  @ApiProperty({
    description: 'The value of the given share at the given timestamp',
    example: 150,
  })
  @Prop()
  price: number;

  @ApiProperty({
    description: 'The timestamp of the transaction',
    example: 1615456461931,
  })
  @Prop()
  timestamp: number;
}

export const PriceSchema = SchemaFactory.createForClass(Price);
