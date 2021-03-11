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
    // transform order
    if (job.data.triggerId) {
      await this.orderService.transformStopOrder(job.data.triggerId);
    }
    // delete order
    else if ((job.data.dto as DeleteOrderDto).orderId) {
      await this.orderService.deleteOrder(
        job.data.broker,
        job.data.dto as DeleteOrderDto,
      );
      // place order
    } else if ((job.data.dto as PlaceOrderDto).onPlace) {
      await this.orderService.placeOrder(
        job.data.broker,
        job.data.dto as PlaceOrderDto,
      );
    }
  }
}
