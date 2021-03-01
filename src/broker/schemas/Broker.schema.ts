import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_doc: Broker, ret: Broker) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Broker extends Document {
  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  token: string;

  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  type: 'private' | 'business' | 'simulation' | 'stockmarket';

  @ApiProperty({
    description: 'TODO:',
  })
  @Prop()
  displayName: string;
}

export const BrokerSchema = SchemaFactory.createForClass(Broker);
