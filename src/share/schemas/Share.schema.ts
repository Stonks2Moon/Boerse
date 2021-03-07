import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_doc: Share, ret: Share): Share => {
      delete ret._id;
      delete ret.__v;
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
}

export const ShareSchema = SchemaFactory.createForClass(Share);
