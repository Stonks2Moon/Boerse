import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Clearing, ClearingSchema } from 'src/clearing/schemas/Clearing.schema';
import { Share, ShareSchema } from 'src/share/schemas/Share.schema';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderSchema } from './schemas/Order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Share.name, schema: ShareSchema },
      { name: Clearing.name, schema: ClearingSchema },
    ]),
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
