import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { OrderService } from 'src/order/order.service';
import { QueueItem } from './dtos/QueueItem.dto';

@Processor('action')
export class QueueProcessor {
  constructor(private readonly orderService: OrderService) {}

  @Process({ concurrency: 1 })
  async handleJob(job: Job<QueueItem>): Promise<void> {
    const { broker, deleteOrder, placeOrder, triggerId } = job.data;

    // transform order
    if (triggerId) {
      await this.orderService.transformStopOrder(triggerId);
    }
    // delete order
    else if (deleteOrder && broker) {
      await this.orderService.deleteOrder(broker, deleteOrder);
    }
    // place order
    else if (placeOrder && broker) {
      await this.orderService.placeOrder(job.id, broker, placeOrder);
    }
  }
}
