import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { DeleteOrderDto } from './dtos/DeleteOrder.dto';
import { PlaceOrderDto } from './dtos/PlaceOrder.dto';
import { QueueItem } from './dtos/QueueItem.dto';
import { OrderService } from './order.service';

@Processor('action')
export class QueueProcessor {
  constructor(private readonly orderService: OrderService) {}

  @Process({ concurrency: 1 })
  async handleJob(job: Job<QueueItem>): Promise<void> {
    if ((job.data.dto as DeleteOrderDto).orderId) {
      await this.orderService.deleteOrder(
        job.data.broker,
        job.data.dto as DeleteOrderDto,
      );
    } else {
      await this.orderService.placeOrder(
        job.data.broker,
        job.data.dto as PlaceOrderDto,
      );
    }
  }
}
