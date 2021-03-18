import { InjectQueue } from '@nestjs/bull';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { DeleteOrderDto } from 'src/order/dtos/DeleteOrder.dto';
import { PlaceOrderDto } from 'src/order/dtos/PlaceOrder.dto';
import { UnqueueJobDto } from 'src/order/dtos/UnqueueJob.dto';
import { OrderService } from 'src/order/order.service';
import { QueuedJob } from './dtos/QueuedJob.dto';
import { QueueItem } from './dtos/QueueItem.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('action') private readonly actionQueue: Queue<QueueItem>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  public async stopTransformJob(orderId: string): Promise<void> {
    await this.actionQueue.add({ triggerId: orderId });
  }

  public async placeOrderJob(
    dto: PlaceOrderDto,
    broker: BrokerModel,
  ): Promise<QueuedJob> {
    const job = await this.actionQueue.add({ placeOrder: dto, broker });
    return new QueuedJob(job);
  }

  public async deleteJob(
    dto: DeleteOrderDto,
    broker: BrokerModel,
  ): Promise<QueuedJob> {
    const _ = await this.orderService.getOrder(broker, dto.orderId);
    const job = await this.actionQueue.add(
      { deleteOrder: dto, broker },
      { priority: 10 },
    );
    return new QueuedJob(job);
  }

  public async unqueueJob(
    dto: UnqueueJobDto,
    broker: BrokerModel,
  ): Promise<boolean> {
    const job = await this.actionQueue.getJob(dto.jobId);
    if (!job) return false;

    if (job.data.broker.id === broker.id) {
      await job.remove();
      return true;
    }
    return false;
  }
}
