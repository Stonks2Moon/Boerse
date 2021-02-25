export class PlaceOrder {
  shareId: string;
  amount: number;
  callback: string;
  type: 'buy' | 'sell';
  limit: number;

  stop?: number;
  stopLimit?: number;
}
