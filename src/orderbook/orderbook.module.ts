import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/order/schemas/Order.schema';
import { ShareModule } from 'src/share/share.module';
import { OrderbookController } from './orderbook.controller';
import { OrderbookService } from './orderbook.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ShareModule,
  ],
  controllers: [OrderbookController],
  providers: [OrderbookService],
})
export class OrderbookModule {}
