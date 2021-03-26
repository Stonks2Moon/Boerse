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
  })
  @Prop()
  name: string;

  @ApiProperty({
    description: "The share's current value",
  })
  @Prop()
  price: number;

  @ApiProperty({
    description: 'Display color for texts or anything else',
  })
  @Prop()
  color: string;

  @ApiProperty({
    description: 'Thumbnail of the assets (e.g. coin)',
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
