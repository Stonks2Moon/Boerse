import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { OrderModule } from 'src/order/order.module';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';

@Module({
  controllers: [],
  imports: [
    BullModule.registerQueue({ name: 'action' }),
    forwardRef(() => OrderModule),
  ],
  providers: [QueueProcessor, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
