export interface IOrder {
  _id?: string;

  brokerId: string;
  // ISIN
  shareId: string;

  timestamp: number;
  amount: number;

  callback: string;

  type: 'buy' | 'sell';

  // -1 = market
  limit: number;

  stop?: number;
  // -1 = market
  stopLimit?: number;
}

/**
 *
 * Order SELL 100 Stk.
 *
 * -> BUY 50 Stk.
 *
 * order.amount -50;
 *
 * clearing => { shareId, brokerId, amount, timestamp, type, // ? limit, stop, stopLimit }
 *
 * order.amount == 0?
 * delete Order
 * call callback()
 *
 */
