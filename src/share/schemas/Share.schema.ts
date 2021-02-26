import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true } })
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
