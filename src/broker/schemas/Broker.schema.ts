import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Broker extends Document {
  @Prop()
  token: string;

  @Prop()
  type: 'private' | 'business' | 'simulation';

  @Prop()
  displayName: string;
}

export const BrokerSchema = SchemaFactory.createForClass(Broker);
