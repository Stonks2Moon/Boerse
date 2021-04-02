import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { Order } from 'src/order/schemas/Order.schema';
import { ShareService } from 'src/share/share.service';
import { LimitAndAmount } from './models/LimitAndAmount.model';
import { Orderbook } from './models/Orderbook.model';

@Injectable()
export class OrderbookService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly shareService: ShareService,
  ) {}

  async getOrderbook(
    shareId: string,
    limit: number | string = 10,
  ): Promise<Orderbook> {
    const share = await this.shareService.getShare(shareId);
    if (!share) return null;

    if (isNaN(+limit) || +limit <= 0) {
      limit = 10;
    }

    const buySort = { market: -1, limit: -1, timestamp: 1 };
    const sellSort = { market: 1, limit: 1, timestamp: 1 };

    const orders = () => this.orderModel.find({ shareId: shareId });
    const stops = () => this.orderModel.find({ stop: { $exists: true } });
    const buys = () =>
      orders()
        .find({ type: 'buy', stop: { $exists: false } })
        .sort(buySort);
    const sells = () =>
      orders()
        .find({ type: 'sell', stop: { $exists: false } })
        .sort(sellSort);

    const map = (o: Query<Order[], Order>) =>
      o.select('amount limit stop timestamp').limit(+limit);

    return {
      price: share.price,
      shareId: shareId,
      totalOrders: await orders().countDocuments(),
      totalStopOrders: await stops().countDocuments(),
      totalBuyOrders: await buys().countDocuments(),
      totalSellOrders: await sells().countDocuments(),
      buyOrders: await map(buys()),
      sellOrders: (await map(sells())).reverse(),
    };
  }

  async getLimitsAndAmounts(shareId: string): Promise<LimitAndAmount[]> {
    return this.orderModel
      .aggregate()
      .match({
        shareId: shareId,
        limit: { $exists: true },
        stop: { $exists: false },
      })
      .project({ amount: 1, limit: 1, type: 1, _id: 0 })
      .sort({ limit: 1 });
  }
}
