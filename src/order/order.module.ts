import { BullModule } from '@nestjs/bull';
import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Clearing, ClearingSchema } from 'src/clearing/schemas/Clearing.schema';
import { ShareModule } from 'src/share/share.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';
import { Order, OrderSchema } from './schemas/Order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Clearing.name, schema: ClearingSchema },
    ]),
    BullModule.registerQueue({ name: 'action' }),
    ShareModule,
    HttpModule,
  ],
  providers: [OrderService, QueueService, QueueProcessor],
  controllers: [OrderController],
})
export class OrderModule {}
