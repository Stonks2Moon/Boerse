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

  public async isOpen(): Promise<boolean> {
    const shares = await this.shareModel.find({
      tradeDisabled: { $exists: true },
    });
    if (shares.length > 0) return false;
    return true;
  }

  public async isClosed(): Promise<boolean> {
    return !(await this.isOpen());
  }

  public async getStatus(): Promise<MarketStatus> {
    const isOpen = await this.isOpen();
    return isOpen ? MarketStatus.OPEN : MarketStatus.CLOSED;
  }

  public async setStatus(status: MarketStatus): Promise<boolean> {
    if (status === MarketStatus.OPEN) {
      await this.openMarket();
    } else {
      await this.closeMarket();
    }
    return true;
  }

  public async openMarket(): Promise<boolean> {
    await this.shareModel.updateMany({}, { $unset: { tradeDisabled: '' } });
    return true;
  }

  public async closeMarket(): Promise<boolean> {
    await this.shareModel.updateMany({}, { $set: { tradeDisabled: true } });
    return true;
  }
}
