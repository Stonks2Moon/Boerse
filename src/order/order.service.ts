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
    await this.orderModel.updateOne(
      { _id: id, brokerId: broker.id },
      { $set: { deleteRequested: true } },
    );
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

    await this.printOrderBook(order.shareId);
    await this.orderPlaced(placedOrder);
    await this.printOrderBook(order.shareId);

    return placedOrder;
  }

  private async orderPlaced(order: Order): Promise<void> {
    if (order.type === 'buy') {
      await this.buyOrderPlaced(order);
    } else {
      await this.sellOrderPlaced(order);
    }
    await this.orderModel.deleteMany({ amount: { $lte: 0 } });
  }

  private async buyOrderPlaced(buyOrder: Order): Promise<void> {
    const { shareId } = buyOrder;
    const sellOrders = (await this.getSellOrders(shareId)).reverse();

    if (sellOrders.length === 0) return;

    let remaining = buyOrder.amount;
    const refPrice = await this.shareService.getCurrentPrice(shareId);

    for (let i = 0; i < sellOrders.length && remaining > 0; i++) {
      const sO = sellOrders[i];

      let newPrice = 0;
      const remainingLimits = this.getRemainingLimits(sellOrders, i);

      if (!buyOrder.limit) {
        newPrice = sO.limit || Math.min(refPrice, ...remainingLimits);
      } else {
        newPrice =
          sO.limit || Math.min(refPrice, buyOrder.limit, ...remainingLimits);

        if (newPrice > buyOrder.limit) {
          return;
        }
      }
      remaining = await this.match(newPrice, remaining, shareId, buyOrder, sO);
    }
  }

  private async sellOrderPlaced(sellOrder: Order): Promise<void> {
    const { shareId } = sellOrder;
    const buyOrders = await this.getBuyOrders(shareId);

    if (buyOrders.length === 0) return;

    let remaining = sellOrder.amount;
    const refPrice = await this.shareService.getCurrentPrice(shareId);

    for (let i = 0; i < buyOrders.length && remaining > 0; i++) {
      const bO = buyOrders[i];

      let newPrice = 0;
      const remainingLimits = this.getRemainingLimits(buyOrders, i);

      if (!sellOrder.limit) {
        newPrice = bO.limit || Math.max(refPrice, ...remainingLimits);
      } else {
        newPrice =
          bO.limit || Math.max(refPrice, sellOrder.limit, ...remainingLimits);

        if (newPrice < sellOrder.limit) {
          return;
        }
      }
      remaining = await this.match(newPrice, remaining, shareId, sellOrder, bO);
    }
  }

  private async match(
    price: number,
    remaining: number,
    shareId: string,
    inputOrder: Order,
    matchingOrder: Order,
  ): Promise<number> {
    await this.shareService.updatePrice(shareId, price);

    if (matchingOrder.amount >= remaining) {
      await this.updateOrderAmount(inputOrder, remaining, price);
      await this.updateOrderAmount(matchingOrder, remaining, price);
      remaining = 0;
    } else {
      await this.updateOrderAmount(inputOrder, matchingOrder.amount, price);
      await this.updateOrderAmount(matchingOrder, matchingOrder.amount, price);
      remaining -= matchingOrder.amount;
    }
    return remaining;
  }

  private getRemainingLimits(orders: Order[], index: number): number[] {
    return [...orders]
      .filter((x, k) => k >= index && x.limit)
      .map((x) => x.limit);
  }

  private async updateOrderAmount(
    order: Order,
    amount: number,
    price: number,
  ): Promise<void> {
    this.addToClearing(order, amount, price);

    await this.orderModel.updateOne(
      { _id: order._id },
      { $inc: { amount: -amount } },
    );
  }

  private async addToClearing(
    order: Order,
    amount: number,
    price: number,
  ): Promise<void> {
    await this.clearingModel.create({
      brokerId: order.brokerId,
      shareId: order.shareId,
      timestamp: new Date().getTime(),
      amount: amount,
      price: price,
      type: order.type,
      limit: order.limit,
      stop: order.stop,
      stopLimit: order.stopLimit,
    });
  }

  private async getBuyOrders(shareId: string): Promise<Order[]> {
    return (
      await this.orderModel
        .find({
          shareId: shareId,
          type: 'buy',
        })
        .sort({ limit: -1, timestamp: -1 })
    ).sort((a, b) => {
      if (!a.limit && b.limit) return -1;
      if (a.limit == b.limit) return a.timestamp - b.timestamp;
      return b.limit - a.limit;
    });
  }

  private async getSellOrders(shareId: string): Promise<Order[]> {
    return this.orderModel
      .find({
        shareId: shareId,
        type: 'sell',
      })
      .sort({ limit: -1, timestamp: -1 });
  }

  public async printOrderBook(shareId: string): Promise<void> {
    const buyOrders = await this.getBuyOrders(shareId);
    const sellOrders = await this.getSellOrders(shareId);

    const prettyTS = (timestamp: number): string => {
      if (timestamp === 0) return '-\t';
      return new Date(timestamp).toLocaleTimeString();
    };

    const price = await this.shareService.getCurrentPrice(shareId);

    console.log('');
    console.log(`Kauf \t      \t     \t${price}  \t     \t       \tVerkauf`);
    console.log('Zeit\t\tVolumen\tLimit\t  \tLimit\tVolumne\tZeit');

    sellOrders.forEach((s) => {
      console.log(
        `\t\t\t\t\t${s.limit || 'Market'}\t${s.amount}\t${prettyTS(
          s.timestamp,
        )}`,
      );
    });

    buyOrders.forEach((b) => {
      console.log(
        `${prettyTS(b.timestamp)}\t${b.amount}\t${b.limit || 'Market'}`,
      );
    });

    console.log('');
    console.log('');
  }
}
