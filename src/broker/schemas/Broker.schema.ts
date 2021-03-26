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
    description: 'Token of broker, to identify and authenticate.',
  })
  @Prop()
  token: string;

  @ApiProperty({
    description: 'Type of broker. Important for clearing and access rights',
    type: 'BrokerType',
    example: 'business',
  })
  @Prop()
  type: 'private' | 'business' | 'simulation' | 'stockmarket';

  @ApiProperty({
    description: 'Internal displayName for an specific broker',
    example: 'Coinbase',
  })
  @Prop()
  displayName: string;

  @ApiProperty({
    description: 'Determines if broker is banned',
  })
  @Prop({ required: false })
  banned?: boolean;
}

export const BrokerSchema = SchemaFactory.createForClass(Broker);
