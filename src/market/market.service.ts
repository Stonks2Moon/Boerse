import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Share } from 'src/share/schemas/Share.schema';

export enum MarketStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Injectable()
export class MarketService {
  constructor(
    @InjectModel(Share.name) private readonly shareModel: Model<Share>,
  ) {}

  /**
   * Checks if market is currently open
   * @returns true
   */
  public async isOpen(): Promise<boolean> {
    const shares = await this.shareModel.find({
      tradeDisabled: { $exists: true },
    });
    if (shares.length > 0) return false;
    return true;
  }

  /**
   * Checks if market is closed (not open)
   * @returns false
   */
  public async isClosed(): Promise<boolean> {
    return !(await this.isOpen());
  }

  /**
   * Checks market status
   * @returns either open or closed
   */
  public async getStatus(): Promise<MarketStatus> {
    const isOpen = await this.isOpen();
    return isOpen ? MarketStatus.OPEN : MarketStatus.CLOSED;
  }

  /**
   * Sets new market status
   * @param status MarketStatus
   * @returns true
   */
  public async setStatus(status: MarketStatus): Promise<boolean> {
    if (status === MarketStatus.OPEN) {
      await this.openMarket();
    } else {
      await this.closeMarket();
    }
    return true;
  }

  /**
   * opens market for trade
   * @returns true
   */
  public async openMarket(): Promise<boolean> {
    await this.shareModel.updateMany({}, { $unset: { tradeDisabled: '' } });
    return true;
  }

  /**
   * closes market for trade
   * @returns true
   */
  public async closeMarket(): Promise<boolean> {
    await this.shareModel.updateMany({}, { $set: { tradeDisabled: true } });
    return true;
  }
}
