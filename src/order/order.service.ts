import {
  forwardRef,
  HttpService,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JobId } from 'bull';
import {
  FilterQuery,
  isValidObjectId,
  LeanDocument,
  Model,
  _AllowStringsForIds,
} from 'mongoose';
import { BrokerModel } from 'src/broker/models/Broker.model';
import { Clearing } from 'src/clearing/schemas/Clearing.schema';
import { MSSocket } from 'src/MSSocket';
import { QueuedJob } from 'src/queue/dtos/QueuedJob.dto';
import { QueueService } from 'src/queue/queue.service';
import { ShareService } from 'src/share/share.service';
import { DeleteOrderDto } from './dtos/DeleteOrder.dto';
import { OrderCompletedDto } from './dtos/OrderCompleted.dto';
import { OrderDeletedDto } from './dtos/OrderDeleted.dto';
import { OrderMatchedDto } from './dtos/OrderMatched.dto';
import { PlaceOrderDto } from './dtos/PlaceOrder.dto';
import { UnqueueJobDto } from './dtos/UnqueueJob.dto';
import { OrderValidator } from './OrderValidator';
import { Order } from './schemas/Order.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Clearing.name) private clearingModel: Model<Clearing>,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
    private readonly shareService: ShareService,
    private readonly httpService: HttpService,
    private readonly msSocket: MSSocket,
  ) {}

  //get all 'open' orders
  public async getOrders(): Promise<Order[]> {
    return this.orderModel.find();
  }

  /**
   * get Orders
   * @param broker: iformation about broker
   * @param id: id of Order
   */
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
      this.msSocket.server.to('stockmarket').emit('update-orderbook');
      this.httpService.post(order.onDelete, orderDeleted);
    }
  }

  /**
   * place new order
   * @param jobId: id of the Job placing the order
   * @param broker: information about broker who placed order
   * @param dto: information about order to be placed
   * create new order with timestamp
   * post request + call method orderPlaced
   */
  public async placeOrder(
    jobId: JobId,
    broker: BrokerModel,
    dto: PlaceOrderDto,
  ): Promise<void> {
    const order = await this.orderModel.create({
      ...dto,
      brokerId: broker.id,
      timestamp: new Date().getTime(),
    });

    this.httpService.post(order.onPlace, {
      jobId: jobId.toString(),
      ...order.toJSON(),
    });
    await this.orderPlaced(order);
  }

  /**
   * place order in orderbook
   * differentiate between buy order and sell order
   * @param order: information about placed order
   */
  private async orderPlaced(order: Order): Promise<void> {
    const refPriceStart = await this.shareService.getCurrentPrice(
      order.shareId,
    );

    if (order.type === 'buy') {
      if (order.stop && refPriceStart < order.stop) {
        this.msSocket.server.to('stockmarket').emit('update-orderbook');
        return;
      }
      await this.buyOrderPlaced(order);
    } else {
      if (order.stop && refPriceStart > order.stop) {
        this.msSocket.server.to('stockmarket').emit('update-orderbook');
        return;
      }
      await this.sellOrderPlaced(order);
    }

    // check if order can be deleted
    const readyForDelete = await this.orderModel.find({ amount: { $lte: 0 } });
    await Promise.all(
      readyForDelete.map(async (d) => {
        this.httpService.post(d.onComplete, new OrderCompletedDto(d));
        await d.delete();
      }),
    );

    const refPriceEnd = await this.shareService.getCurrentPrice(order.shareId);

    const filter: FilterQuery<_AllowStringsForIds<LeanDocument<Order>>>[] = [
      { stop: { $exists: true } },
      { stop: { $ne: -1 } },
    ];

    // update Orderbook after checking for Stop-Limit-Orders
    if (refPriceEnd > refPriceStart) {
      await this.checkStopLimits({
        type: 'buy',
        shareId: order.shareId,
        $and: [...filter, { stop: { $gte: refPriceEnd } }],
      });
    } else if (refPriceEnd < refPriceStart) {
      await this.checkStopLimits({
        type: 'sell',
        shareId: order.shareId,
        $and: [...filter, { stop: { $lte: refPriceEnd } }],
      });
    }
    this.msSocket.server.to('stockmarket').emit('update-orderbook');
  }

  /**
   * check for Stop-Limit-Orders
   * @param query: information about orders in query
   */
  private async checkStopLimits(query: FilterQuery<Order>): Promise<void> {
    const orders = await this.orderModel.find(query).sort({ timestamp: -1 });

    await Promise.all(
      orders.map(async (o) => {
        await o.update({ $set: { stop: -1 } });
        this.queueService.stopTransformJob(o._id);
      }),
    );
  }

  /**
   * tranfsorm Stop-Order if Limit is reached
   * @param orderId: id of this order
   */
  public async transformStopOrder(orderId: string): Promise<void> {
    let order = await this.orderModel.findOne({ _id: orderId });
    if (!order) return;

    await order.update({ $unset: { stop: true } });

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
   * @param buyOrder: information about this buyOrder
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
   * @param sellOrder: informaiton about this sellOrder
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
   * @param price: price of order
   * @param remaining: remaining orders after previous matching
   * @param shareId: shareId
   * @param iOrder: information about input order
   * @param mOrder: information about matching order
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

    this.msSocket.server
      .to('stockmarket')
      .emit('match', { shareId: shareId, amount: amount, price: price });

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
   * @param index: where to find order
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

  /**
   * get sorted (limit and timestamp) list of all buy orders
   * @param shareId: id of share
   */
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

  /**
   * get sorted (limit and timestamp) list of all sell orders
   * @param shareId: id of share
   */
  private async getSellOrders(shareId: string): Promise<Order[]> {
    return this.orderModel
      .find({
        shareId: shareId,
        type: 'sell',
        stop: { $exists: false },
      })
      .sort({ limit: -1, timestamp: -1 });
  }

  /**
   * Request to delete an order
   * @param dto: Job to delete an order
   * @param broker: information about broker who sent deleteRequest
   */
  public async deleteRequest(
    dto: DeleteOrderDto | UnqueueJobDto,
    broker: BrokerModel,
  ): Promise<QueuedJob | boolean> {
    // unqueue job
    if ((dto as UnqueueJobDto).jobId) {
      return this.queueService.unqueueJob(dto as UnqueueJobDto, broker);
    }
    // delete order
    else if ((dto as DeleteOrderDto).orderId) {
      return this.queueService.deleteJob(dto as DeleteOrderDto, broker);
    }
  }

  /**
   * Request to place an order
   * @param dto: Job to place an order
   * @param broker: information about broker who sent placeRequest
   */
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

    return this.queueService.placeOrderJob(dto, broker);
  }
}
