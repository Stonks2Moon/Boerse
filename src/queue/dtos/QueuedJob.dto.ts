import { Job } from 'bull';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { DeleteOrderDto } from 'src/order/dtos/DeleteOrder.dto';
import { PlaceOrderDto } from 'src/order/dtos/PlaceOrder.dto';
import { QueueItem } from './QueueItem.dto';

export class QueuedJob {
  id: string;
  broker?: BrokerModel;
  placeOrder?: PlaceOrderDto;
  deleteOrder?: DeleteOrderDto;
  triggerId?: string;

  constructor(job: Job<QueueItem>) {
    const { broker, deleteOrder, placeOrder, triggerId } = job.data;

    this.id = job.id.toString();

    this.broker = broker;
    this.placeOrder = placeOrder;
    this.deleteOrder = deleteOrder;
    this.triggerId = triggerId;
  }
}
