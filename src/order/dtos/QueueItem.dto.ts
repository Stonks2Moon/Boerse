import { Job } from 'bull';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { DeleteOrderDto } from './DeleteOrder.dto';
import { PlaceOrderDto } from './PlaceOrder.dto';

export class QueueItem {
  dto: PlaceOrderDto | DeleteOrderDto;
  broker: BrokerModel;
  triggerId?: string;
}

export class QueuedJob {
  id: string;
  data: {
    dto: PlaceOrderDto | DeleteOrderDto;
    broker: BrokerModel;
    triggerId?: string;
  };

  constructor(job: Job<QueueItem>) {
    this.id = job.id.toString();
    this.data = job.data;
  }
}
