import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Share extends Document {
  @Prop()
  name: string;

  @Prop()
  price: number;
}

export const ShareSchema = SchemaFactory.createForClass(Share);
