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

    await this.printOrderBook(order.shareId);
    await this.orderPlaced(placedOrder);
    await this.printOrderBook(order.shareId);

    return placedOrder;
  }

  private async totalOrders(
    type: 'buy' | 'sell',
    shareId: string,
  ): Promise<number> {
    return await this.orderModel
      .find({
        type: type,
        shareId: shareId,
        amount: { $gt: 0 },
      })
      .countDocuments();
  }

  private async getMarketOrders(
    type: 'sell' | 'buy',
    shareId: string,
  ): Promise<Order[]> {
    return this.orderModel.find({
      type: type,
      shareId: shareId,
      limit: { $exists: false },
      amount: { $gt: 0 },
    });
  }

  private async getLimitOrders(
    type: 'sell' | 'buy',
    shareId: string,
  ): Promise<Order[]> {
    return this.orderModel.find({
      type: type,
      shareId: shareId,
      limit: { $exists: true },
      amount: { $gt: 0 },
    });
  }

  private async orderPlaced(order: Order): Promise<void> {
    if (order.type === 'buy') {
      await this.buyOrderPlaced(order);
    } else {
      await this.sellOrderPlaced(order);
    }
    await this.orderModel.deleteMany({ amount: { $lte: 0 } });
    // const session = await startSession();
    // session.startTransaction();
    // try {

    //   await session.commitTransaction();
    // } catch (error) {
    //   await session.abortTransaction();
    //   console.error('Transaction Error', error);

    //   throw error;
    // } finally {
    //   session.endSession();
    // }

    // const { shareId, type, amount, limit } = order;
    // const currentPrice = await this.shareService.getCurrentPrice(shareId);
    // this.shareService.updatePrice(shareId, currentPrice);
  }

  private async buyOrderPlaced(order: Order): Promise<void> {
    const shareId = order.shareId;

    console.log('Buy order placed');

    // Regel 4a
    if ((await this.totalOrders('sell', shareId)) === 0) {
      console.log('Regel 4a');
      return;
    }

    let marketOrders = await this.getMarketOrders('sell', shareId);
    let limitOrders = await this.getLimitOrders('sell', shareId);
    const onlyMarketOrders = limitOrders.length === 0;
    const onlyLimitOrders = marketOrders.length === 0;

    console.log('Only market orders?', onlyMarketOrders);
    console.log('Is incoming order MarketOrder?', !order.limit);

    let remaining = order.amount;

    // Regel 1
    if (!order.limit && onlyMarketOrders) {
      console.log('Regel 1');
      marketOrders = marketOrders.sort((a, b) => a.timestamp - b.timestamp);

      const price = await this.shareService.getCurrentPrice(order.shareId);

      let o: Order | undefined = undefined;
      while ((o = marketOrders.shift()) !== undefined && remaining > 0) {
        if (o.amount >= remaining) {
          await this.updateOrderAmount(order, remaining, price);
          await this.updateOrderAmount(o, remaining, price);
          remaining = 0;
        } else {
          await this.updateOrderAmount(order, o.amount, price);
          await this.updateOrderAmount(o, o.amount, price);
          remaining -= o.amount;
        }
      }
    }

    // Regel 2
    else if (onlyLimitOrders) {
      console.log('Regel 2');
      limitOrders = limitOrders
        .sort((a, b) => b.timestamp - a.timestamp)
        .sort((a, b) => a.limit - b.limit);

      if (order.limit) {
        limitOrders = limitOrders.filter(lO => lO.limit <= order.limit);
      }

      let o: Order | undefined = undefined;
      while ((o = limitOrders.shift()) !== undefined && remaining > 0) {
        const price = o.limit;
        if (o.amount >= remaining) {
          await this.updateOrderAmount(order, remaining, price);
          await this.updateOrderAmount(o, remaining, price);
          remaining = 0;
        } else {
          await this.updateOrderAmount(order, o.amount, price);
          await this.updateOrderAmount(o, o.amount, price);
          remaining -= o.amount;
        }

        await this.shareService.updatePrice(shareId, price);
      }

      await this.checkStopOrders();
    }

    // Regel 3
    else if (!order.limit) {
      console.log('Regel 3');
      const orders = await this.orderModel
        .find({ shareId: shareId, type: 'sell' })
        .sort({ limit: 1 });

      let o: Order | undefined = undefined;
      while ((o = orders.shift()) !== undefined && remaining > 0) {
        const price =
          o.limit || (await this.shareService.getCurrentPrice(shareId));

        if (o.amount >= remaining) {
          await this.updateOrderAmount(order, remaining, price);
          await this.updateOrderAmount(o, remaining, price);
          remaining = 0;
        } else {
          await this.updateOrderAmount(order, o.amount, price);
          await this.updateOrderAmount(o, o.amount, price);
          remaining -= o.amount;
        }

        if (o.limit) {
          await this.shareService.updatePrice(shareId, price);
        }
      }

      await this.checkStopOrders();

      // Regel V
    } else if (
      order.limit >= (await this.shareService.getCurrentPrice(order.shareId))
    ) {
      console.log('Regel V');
      const price = await this.shareService.getCurrentPrice(order.shareId);
      const orders = await this.orderModel
        .find({
          shareId: order.shareId,
          type: 'sell',
          $or: [
            { limit: { $exists: false } },
            { limit: { $lte: order.limit || price } },
          ],
        })
        .sort({ timestamp: 1, limit: 1 });

      // TODO: Ask G.
      let o: Order | undefined = undefined;
      while ((o = orders.shift()) !== undefined && remaining > 0) {
        if (o.amount >= remaining) {
          await this.updateOrderAmount(order, remaining, price);
          await this.updateOrderAmount(o, remaining, price);
          remaining = 0;
        } else {
          await this.updateOrderAmount(order, o.amount, price);
          await this.updateOrderAmount(o, o.amount, price);
          remaining -= o.amount;
        }
      }
    } else {
      console.log('Keine Regel zugetroffen...');
    }
  }

  private async sellOrderPlaced(order: Order): Promise<void> {
    console.log('sell order placed');
    const shareId = order.shareId;

    // Regel 4a
    if ((await this.totalOrders('buy', shareId)) === 0) {
      console.log('Regel 4a');
      return;
    }

    let marketOrders = await this.getMarketOrders('buy', shareId);
    let limitOrders = await this.getLimitOrders('buy', shareId);
    const onlyMarketOrders = limitOrders.length === 0;
    const onlyLimitOrders = marketOrders.length === 0;

    console.log('Only market orders?', onlyMarketOrders);
    console.log('Is incoming order MarketOrder?', !order.limit);
    console.log('');

    let remaining = order.amount;

    // Regel 1
    if (!order.limit && onlyMarketOrders) {
      console.log('Regel 1');
      marketOrders = marketOrders.sort((a, b) => a.timestamp - b.timestamp);

      const price = await this.shareService.getCurrentPrice(order.shareId);

      let o: Order | undefined = undefined;
      while ((o = marketOrders.shift()) !== undefined && remaining > 0) {
        if (o.amount >= remaining) {
          await this.updateOrderAmount(order, remaining, price);
          await this.updateOrderAmount(o, remaining, price);
          remaining = 0;
        } else {
          await this.updateOrderAmount(order, o.amount, price);
          await this.updateOrderAmount(o, o.amount, price);
          remaining -= o.amount;
        }
      }
    }

    // Regel 2
    else if (onlyLimitOrders) {
      console.log('Regel 2');
      limitOrders = limitOrders
        .sort((a, b) => b.timestamp - a.timestamp)
        .sort((a, b) => b.limit - a.limit);

      if (order.limit) {
        limitOrders = limitOrders.filter(lO => lO.limit >= order.limit);
      }

      let o: Order | undefined = undefined;
      while ((o = limitOrders.shift()) !== undefined && remaining > 0) {
        const price = o.limit;

        if (o.amount >= remaining) {
          await this.updateOrderAmount(order, remaining, price);
          await this.updateOrderAmount(o, remaining, price);
          remaining = 0;
        } else {
          await this.updateOrderAmount(order, o.amount, price);
          await this.updateOrderAmount(o, o.amount, price);
          remaining -= o.amount;
        }

        await this.shareService.updatePrice(shareId, price);
      }

      await this.checkStopOrders();
    }

    // Regel 3
    else if (!order.limit) {
      console.log('Regel 3');
      const orders = await this.orderModel
        .find({ shareId: shareId, type: 'buy' })
        .sort({ limit: -1 });

      let o: Order | undefined = undefined;
      while ((o = orders.shift()) !== undefined && remaining > 0) {
        const price =
          o.limit || (await this.shareService.getCurrentPrice(shareId));

        if (o.amount >= remaining) {
          await this.updateOrderAmount(order, remaining, price);
          await this.updateOrderAmount(o, remaining, price);
          remaining = 0;
        } else {
          await this.updateOrderAmount(order, o.amount, price);
          await this.updateOrderAmount(o, o.amount, price);
          remaining -= o.amount;
        }

        if (o.limit) {
          await this.shareService.updatePrice(shareId, price);
        }
      }

      await this.checkStopOrders();
    }

    // Regel V
    else if (
      order.limit >= (await this.shareService.getCurrentPrice(order.shareId))
    ) {
      console.log('Regel V');
      const price = await this.shareService.getCurrentPrice(order.shareId);
      const orders = await this.orderModel
        .find({
          type: 'buy',
          shareId: order.shareId,
          $or: [
            { limit: { $exists: false } },
            { limit: { $gte: order.limit || price } },
          ],
        })
        .sort({ timestamp: 1, limit: -1 });

      // TODO: Ask G.
      let o: Order | undefined = undefined;
      while ((o = orders.shift()) !== undefined && remaining > 0) {
        if (o.amount >= remaining) {
          await this.updateOrderAmount(order, remaining, price);
          await this.updateOrderAmount(o, remaining, price);
          remaining = 0;
        } else {
          await this.updateOrderAmount(order, o.amount, price);
          await this.updateOrderAmount(o, o.amount, price);
          remaining -= o.amount;
        }
      }
    } else {
      console.log('Keine Regel zugetroffen...');
    }
  }

  private async checkStopOrders(): Promise<void> {
    //
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

  public async printOrderBook(shareId: string): Promise<void> {
    const buyOrders = await this.orderModel
      .find({
        shareId: shareId,
        type: 'buy',
      })
      .sort({ limit: -1 });
    const sellOrders = await this.orderModel
      .find({
        shareId: shareId,
        type: 'sell',
      })
      .sort({ limit: 1 });

    const max = Math.max(sellOrders.length, buyOrders.length);
    const prettyTS = (timestamp: number): string => {
      if (timestamp === 0) return '-\t';
      return new Date(timestamp).toLocaleTimeString();
    };
    const price = await this.shareService.getCurrentPrice(shareId);

    console.log('');
    console.log(`Kauf \t      \t     \t${price}  \t     \t       \tVerkauf`);
    console.log('Zeit\t\tVolumen\tLimit\t  \tLimit\tVolumne\tZeit');
    for (let i = 0; i < max; i++) {
      const buy = buyOrders[i] || { timestamp: 0, limit: '-', amount: '-' };
      const sell = sellOrders[i] || { timestamp: 0, limit: '-', amount: '-' };

      let output = '';
      output += `${prettyTS(buy.timestamp)}\t${buy.amount}\t${buy.limit ||
        'Market'}\t  `;
      output += `\t${sell.limit || 'Market'}\t${sell.amount}\t${prettyTS(
        sell.timestamp,
      )}`;
      console.log(output);
    }
    console.log('');
    console.log('');
  }
}
