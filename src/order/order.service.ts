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

const NOOP = () => {};

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

  /**
   * Sends callback to broker with given url
   * @param url Callback URL, provided by broker
   * @param data data of order
   */
  private sendCallback(url: string, data: any): void {
    if (url.startsWith('http') && url.length > 15) {
      this.httpService
        .post(url, data)
        .toPromise()
        .then(NOOP)
        .catch(() =>
          console.error("[Order Service]\t Couldn't post to url: " + url),
        );
    }
  }

  // TODO: REMOVE IN LATER BUILD ~Timo
  //get all 'open' orders
  public async getOrders(): Promise<Order[]> {
    return this.orderModel.find();
  }

  /**
   * get Orders
   * @param broker: information about broker
   * @param orderId: id of Order
   */
  public async getOrder(broker: BrokerModel, orderId: string): Promise<Order> {
    if (!orderId || !isValidObjectId(orderId)) {
      throw new NotFoundException(`Invalid orderId: '${orderId}'`);
    }

    /**
     * check for order with given id and brokerId
     * @param _id: id of given order
     * @param brokerId: id of broker who placed the order
     */
    const order = await this.orderModel.findOne({
      _id: orderId,
      brokerId: broker.id,
    });

    if (!order) {
      throw new NotFoundException(`Order with id '${orderId}' doesn't exist`);
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
      this.msSocket.server.emit('update-orderbook', dto.orderId);
      this.sendCallback(order.onDelete, orderDeleted);
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
      market: dto.limit ? undefined : true,
      brokerId: broker.id,
      timestamp: Date.now(),
    });

    this.sendCallback(order.onPlace, {
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

    if (order.stop) {
      const condB = order.type === 'buy' && refPriceStart < order.stop;
      const condS = order.type === 'sell' && refPriceStart > order.stop;

      if (condB || condS) {
        this.msSocket.server.emit('update-orderbook', order.shareId);
        return;
      }
    }

    await this.matchOrder(order);

    // check if order can be deleted
    const readyForDelete = await this.orderModel.find({ amount: { $lte: 0 } });
    await Promise.all(
      readyForDelete.map(async (d) => {
        this.sendCallback(d.onComplete, new OrderCompletedDto(d));
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
    this.msSocket.server.emit('update-orderbook', order.shareId);
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
   * Executes the matching algorithm. Finds matching orders and matches them.
   * @param order newly placed order
   * @returns void
   */
  private async matchOrder(order: Order): Promise<void> {
    const { shareId, type } = order;

    // determine sort direction and type based on placed order
    const limitSort = type === 'buy' ? 1 : -1;
    const matchingType = type === 'buy' ? 'sell' : 'buy';

    const possibleMatches = () =>
      this.orderModel
        .find({
          shareId: shareId,
          type: matchingType,
          stop: { $exists: false },
        })
        .sort({ market: -1, limit: limitSort, timestamp: 1 });

    const totalMatchOrders = await possibleMatches().countDocuments();

    if (totalMatchOrders === 0) return;

    // used later to determine the new reference price
    const limitFunc = type === 'buy' ? Math.min : Math.max;
    const refPrice = await this.shareService.getCurrentPrice(shareId);

    let remaining = order.amount;

    for (let i = 0; i <= totalMatchOrders && remaining > 0; i++) {
      // get 'i-th' order from possible matches
      const mOrder = await possibleMatches().skip(i).limit(1).findOne();
      if (mOrder === null) continue;

      // rLs = remaining limits
      // get 'i-th' order with limit from possible matches
      const rLs = await possibleMatches()
        .skip(i)
        .find({ limit: { $exists: true } })
        .limit(1);

      // rLimit = remaining limit
      // determine remaining limit for updated refPrice, if no order exsits
      // or order has no limit, rLimit will default back to the current refPrice
      const rLimit = rLs.length > 0 ? rLs[0].limit || refPrice : refPrice;

      // determine price for which the order will be executed
      const newPrice =
        mOrder.limit || limitFunc(refPrice, order.limit || refPrice, rLimit);

      // check if order has a limit and if the new price exceeds the limit of the order
      if (order.limit) {
        if (type === 'buy' && newPrice > order.limit) return;
        if (type === 'sell' && newPrice < order.limit) return;
      }

      // execute match
      remaining = await this.matched(
        newPrice,
        remaining,
        shareId,
        order,
        mOrder,
      );
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
  private async matched(
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

    this.sendCallback(
      iOrder.onMatch,
      new OrderMatchedDto(iOrder, amount, price),
    );
    this.sendCallback(
      mOrder.onMatch,
      new OrderMatchedDto(mOrder, amount, price),
    );

    remaining -= amount;

    return remaining;
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
  private addToClearing(order: Order, amount: number, price: number): void {
    this.clearingModel
      .create({
        brokerId: order.brokerId,
        shareId: order.shareId,
        timestamp: Date.now(),
        amount: amount,
        price: price,
        type: order.type,
        limit: order.limit,
        stop: order.stop,
      })
      .then(NOOP);
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
