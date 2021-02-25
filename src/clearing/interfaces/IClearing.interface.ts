export interface IClearing {
  _id?: string;
  brokerId: string;
  shareId: string;

  timestamp: number;

  amount: number;
  price: number;

  type: 'buy' | 'sell';
  limit: number;

  stop?: number;
  stopLimit?: number;
}
