import { OrderbookOrder } from './OrderbookOrder.model';

export class Orderbook {
  shareId: string;
  price: number;
  totalOrders: number;
  totalSellOrders: number;
  totalBuyOrders: number;
  totalStopOrders: number;
  sellOrders: OrderbookOrder[];
  buyOrders: OrderbookOrder[];
}
