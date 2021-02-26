import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true } })
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
