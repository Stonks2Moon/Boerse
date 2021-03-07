import { InjectQueue } from '@nestjs/bull';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Queue } from 'bull';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { ShareService } from 'src/share/share.service';
import { DeleteOrderDto } from './dtos/DeleteOrder.dto';
import { PlaceOrderDto } from './dtos/PlaceOrder.dto';
import { QueuedJob, QueueItem } from './dtos/QueueItem.dto';
import { UnqueueJobDto } from './dtos/UnqueueJob.dto';
import { OrderService } from './order.service';
import { OrderValidator } from './OrderValidator';

@Injectable()
export class QueueService {
  constructor(
    private readonly shareService: ShareService,
    private readonly orderService: OrderService,
    @InjectQueue('action') private readonly actionQueue: Queue<QueueItem>,
  ) {}

  public async deleteRequest(
    dto: DeleteOrderDto | UnqueueJobDto,
    broker: BrokerModel,
  ): Promise<QueuedJob | boolean> {
    // unqueue job
    if ((dto as any).jobId) {
      return this.unqueueJob(dto as UnqueueJobDto, broker);
    }
    // delete order
    else if ((dto as any).orderId) {
      return this.deleteJob(dto as DeleteOrderDto, broker);
    }
  }

  public async placeRequest(
    dto: PlaceOrderDto,
    broker: BrokerModel,
  ): Promise<QueuedJob> {
    dto = OrderValidator.validate(dto);

    if (!(await this.shareService.getShare(dto.shareId))) {
      throw new UnprocessableEntityException(
        "Given share with id '" + dto.shareId + "' doesn't exist",
      );
    }

    const job = await this.actionQueue.add({ dto, broker });
    return new QueuedJob(job);
  }

  private async deleteJob(
    dto: DeleteOrderDto,
    broker: BrokerModel,
  ): Promise<QueuedJob> {
    await this.orderService.getOrder(broker, dto.orderId);
    const job = await this.actionQueue.add({ dto, broker }, { priority: 10 });
    return new QueuedJob(job);
  }

  private async unqueueJob(
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
