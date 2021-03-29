import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_doc: Share, ret: Share): Share => {
      delete ret._id;
      delete ret.__v;
      delete ret.tradeDisabled;
      return ret;
    },
  },
})
export class Share extends Document {
  @ApiProperty({
    description: "The share's displayname",
    example: 'Mondgestein',
  })
  @Prop()
  name: string;

  @ApiProperty({
    description: "The share's current value",
    example: 150,
  })
  @Prop()
  price: number;

  @ApiProperty({
    description: 'Display color for texts or anything else',
    example: '#b9050b',
  })
  @Prop()
  color: string;

  @ApiProperty({
    description: 'Thumbnail of the assets (e.g. coin)',
    example:
      'https://timos.s3.eu-central-1.amazonaws.com/moonstonks/MarsCoin.webp',
  })
  @Prop()
  thumbnail: string;

  @ApiProperty({
    description: 'Determines if trade is disabled for given share',
  })
  @Prop({ required: false })
  tradeDisabled?: boolean;
}

export const ShareSchema = SchemaFactory.createForClass(Share);
