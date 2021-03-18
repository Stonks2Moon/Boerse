import { BrokerModel } from 'src/broker/models/Broker.model';
import { DeleteOrderDto } from 'src/order/dtos/DeleteOrder.dto';
import { PlaceOrderDto } from 'src/order/dtos/PlaceOrder.dto';

export class QueueItem {
  broker?: BrokerModel;
  placeOrder?: PlaceOrderDto;
  deleteOrder?: DeleteOrderDto;
  triggerId?: string;
}
