import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { Clearing } from 'src/clearing/schemas/Clearing.schema';
import { ShareService } from 'src/share/share.service';
import { PlaceOrderDto } from './dtos/PlaceOrder.dto';
import { OrderValidator } from './OrderValidator';
import { Order } from './schemas/Order.schema';

@Injectable()
export class OrderService {
  constructor(
    private readonly shareService: ShareService,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Clearing.name) private clearingModel: Model<Clearing>,
  ) {}

  public async getOrder(broker: BrokerModel, id: string): Promise<Order> {
    if (!id || !isValidObjectId(id)) throw new NotFoundException();

    const order = await this.orderModel.findOne({
      _id: id,
      brokerId: broker.id,
    });
    if (!order) throw new NotFoundException();

    return order;
  }

  public async deleteOrder(broker: BrokerModel, id: string): Promise<boolean> {
    const order = await this.getOrder(broker, id);
    await order.deleteOne();
    return true;
  }

  public async placeOrder(
    broker: BrokerModel,
    order: PlaceOrderDto,
  ): Promise<Order> {
    order = OrderValidator.validate(order);

    if (!(await this.shareService.getShare(order.shareId))) {
      throw new UnprocessableEntityException(
        "Given share with id 'shareId' doesn't exist",
      );
    }

    const placedOrder = await this.orderModel.create({
      ...order,
      brokerId: broker.id,
      timestamp: new Date().getTime(),
    });

    this.orderPlaced(placedOrder);

    return placedOrder;
  }

  private async orderPlaced(order: Order): Promise<void> {
    // mix match stuff comes here.

    const { shareId, type, amount, limit } = order;

    const currentPrice = await this.shareService.getCurrentPrice(shareId);
    this.shareService.updatePrice(shareId, currentPrice);
  }
}
