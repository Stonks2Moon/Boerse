import { InjectQueue } from '@nestjs/bull';
import {
  HttpService,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { Clearing } from 'src/clearing/schemas/Clearing.schema';
import { MSSocket } from 'src/MSSocket';
import { ShareService } from 'src/share/share.service';
import { DeleteOrderDto } from './dtos/DeleteOrder.dto';
import { OrderCompletedDto } from './dtos/OrderCompleted.dto';
import { OrderDeletedDto } from './dtos/OrderDeleted.dto';
import { OrderMatchedDto } from './dtos/OrderMatched.dto';
import { PlaceOrderDto } from './dtos/PlaceOrder.dto';
import { QueuedJob, QueueItem } from './dtos/QueueItem.dto';
import { UnqueueJobDto } from './dtos/UnqueueJob.dto';
import { OrderValidator } from './OrderValidator';
import { Order } from './schemas/Order.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectQueue('action') private readonly actionQueue: Queue<QueueItem>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Clearing.name) private clearingModel: Model<Clearing>,
    private readonly shareService: ShareService,
    private readonly httpService: HttpService,
    private readonly msSocket: MSSocket,
  ) {}

  //get all 'open' orders
  public async getOrders(): Promise<Order[]> {
    return this.orderModel.find();
  }

  //get broker and id of order
  public async getOrder(broker: BrokerModel, id: string): Promise<Order> {
    if (!id || !isValidObjectId(id)) {
      throw new NotFoundException(`Invalid orderId: '${id}'`);
    }

    /**
     * check for order with given id and brokerId
     * @param _id: id of given order
     * @param brokerId: id of broker who placed the order
     */
    const order = await this.orderModel.findOne({
      _id: id,
      brokerId: broker.id,
    });
    if (!order) {
      throw new NotFoundException(`Order with id '${id}' doesn't exist`);
    }

    return order;
  }

  /**
   * delete specific order
   * @param broker: information about broker who placed order
   * @param dto: information about order to be deleted
   * get order information, call method order.delete()
   * update orderbook + post request to delete order
   */
  public async deleteOrder(
    broker: BrokerModel,
    dto: DeleteOrderDto,
  ): Promise<void> {
    const order = await this.getOrder(broker, dto.orderId);
    if (order) {
      const orderDeleted = new OrderDeletedDto(order);
      await order.delete();
      this.msSocket.server.emit('update-orderbook');
      this.httpService.post(order.onDelete, orderDeleted);
    }
  }

  /**
   * place new order
   * @param broker: information about broker who placed order
   * @param dto: information about order to be placed
   * create new order with timestamp
   * post request + call method orderPlaced
   */
  public async placeOrder(
    broker: BrokerModel,
    dto: PlaceOrderDto,
  ): Promise<void> {
    const order = await this.orderModel.create({
      ...dto,
      brokerId: broker.id,
      timestamp: new Date().getTime(),
    });

    this.httpService.post(order.onPlace, order);
    await this.orderPlaced(order);
  }

  /**
   * place order in orderbook
   * differentiate between buy order and sell order
   */
  private async orderPlaced(order: Order): Promise<void> {
    const refPriceStart = await this.shareService.getCurrentPrice(
      order.shareId,
    );

    if (order.type === 'buy') {
      if (order.stop && refPriceStart < order.stop) {
        this.msSocket.server.emit('update-orderbook');
        return;
      }
      await this.buyOrderPlaced(order);
    } else {
      if (order.stop && refPriceStart > order.stop) {
        this.msSocket.server.emit('update-orderbook');
        return;
      }
      await this.sellOrderPlaced(order);
    }

    /**
     * delete all orders in orderbook?
     *
     */
    const readyForDelete = await this.orderModel.find({ amount: { $lte: 0 } });
    await Promise.all(
      readyForDelete.map(async (d) => {
        this.httpService.post(d.onComplete, new OrderCompletedDto(d));
        await d.delete();
      }),
    );

    const refPriceEnd = await this.shareService.getCurrentPrice(order.shareId);

    if (refPriceEnd > refPriceStart) {
      await this.checkStopLimits({
        type: 'buy',
        shareId: order.shareId,
        $and: [
          { stop: { $exists: true } },
          { stop: { $ne: -1 } },
          { stop: { $gte: refPriceEnd } },
        ],
      });
    } else if (refPriceEnd < refPriceStart) {
      await this.checkStopLimits({
        type: 'sell',
        shareId: order.shareId,
        $and: [
          { stop: { $exists: true } },
          { stop: { $ne: -1 } },
          { stop: { $lte: refPriceEnd } },
        ],
      });
    }
    this.msSocket.server.emit('update-orderbook');
  }

  private async checkStopLimits(query: FilterQuery<Order>): Promise<void> {
    const orders = await this.orderModel.find(query).sort({ timestamp: -1 });
    await this.orderModel.updateMany(query, { $set: { stop: -1 } });

    orders.forEach((o) => {
      this.stopTransformRequest(o._id);
    });
  }

  public async transformStopOrder(orderId: string): Promise<void> {
    let order = await this.orderModel.findOne({ _id: orderId });
    if (!order) return;

    await this.orderModel.updateOne(
      { _id: orderId },
      { $unset: { stop: true } },
    );

    delete order.stop;
    await this.orderPlaced(order);
  }

  /**
   * place or match a buy order
   * check for sell orders to match with:
   * - if no sell orders, place buy order in orderbook
   * - check if there are sell orders to match with, iterate through sell orders
   *   if market order look for cheapest sell order
   *   if limit order get prices and check if there is a fitting sell order
   *      if sell orders are higher than buy order limit - place buy order
   *   else call this.match
   */
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

  /**
   * place or match a sell order
   * check for buy orders to match with:
   * - if no buy orders, place buy order in orderbook
   * - check if there are buy orders to match with, iterate through buy orders
   *   if market order look for max. buy order
   *   if limit order get prices and check if there is a fitting buy order
   *      if buy orders are lower than sell order limit - place sell order
   *   else call this.match
   */
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

  /**
   * match orders and update orderbook + refPrice
   * for all sellorder and buyorder cases
   * @param price price
   * @param remaining remaining
   * @param shareId shareId
   * @param iOrder input order
   * @param mOrder matching order
   * @returns reamining number
   */
  private async match(
    price: number,
    remaining: number,
    shareId: string,
    iOrder: Order,
    mOrder: Order,
  ): Promise<number> {
    await this.shareService.updatePrice(shareId, price);

    let { amount } = mOrder;
    if (amount > remaining) {
      amount = remaining;
    }

    await this.updateOrderAmount(iOrder, amount, price);
    await this.updateOrderAmount(mOrder, amount, price);

    this.httpService.post(
      iOrder.onMatch,
      new OrderMatchedDto(iOrder, remaining),
    );
    this.httpService.post(
      mOrder.onMatch,
      new OrderMatchedDto(mOrder, remaining),
    );

    remaining -= amount;

    return remaining;
  }

  /**
   * get limits of all orders in orderbook
   * @param orders: all orders in orderbook -> array, so index given
   */
  private getRemainingLimits(orders: Order[], index: number): number[] {
    return [...orders]
      .filter((x, k) => k >= index && x.limit)
      .map((x) => x.limit);
  }

  /**
   * update amount of specific orders after matching
   * @param order: matched order
   * @param amount: how many orders are left
   * @param price: sold for what pricee
   */
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

  /**
   * after matching - write to clearing
   * @param order: matched order
   * @param amount: how many orders were matched
   * @param price: sold for what pricee
   * write all inforation about matched  orders to clearing
   */
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
    });
  }

  //get sorted (limit and timestamp) list of all buy orders
  private async getBuyOrders(shareId: string): Promise<Order[]> {
    return (
      await this.orderModel
        .find({
          shareId: shareId,
          type: 'buy',
          stop: { $exists: false },
        })
        .sort({ limit: -1, timestamp: -1 })
    ).sort((a, b) => {
      if (!a.limit && b.limit) return -1;
      if (a.limit == b.limit) return a.timestamp - b.timestamp;
      return b.limit - a.limit;
    });
  }

  //get sorted (limit and timestamp) list of all sell orders
  private async getSellOrders(shareId: string): Promise<Order[]> {
    return this.orderModel
      .find({
        shareId: shareId,
        type: 'sell',
        stop: { $exists: false },
      })
      .sort({ limit: -1, timestamp: -1 });
  }

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

    const share = await this.shareService.getShare(dto.shareId);
    if (!share) {
      throw new UnprocessableEntityException(
        "Given share with id '" + dto.shareId + "' doesn't exist",
      );
    }

    if (share.tradeDisabled) {
      throw new UnprocessableEntityException(
        "Given share can't be traded at the moment. Market is closed.",
      );
    }

    const job = await this.actionQueue.add({ dto, broker });
    return new QueuedJob(job);
  }

  public async stopTransformRequest(orderId: string): Promise<void> {
    await this.actionQueue.add({ dto: null, broker: null, triggerId: orderId });
  }

  private async deleteJob(
    dto: DeleteOrderDto,
    broker: BrokerModel,
  ): Promise<QueuedJob> {
    await this.getOrder(broker, dto.orderId);
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
