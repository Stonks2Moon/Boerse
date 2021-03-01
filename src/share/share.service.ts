import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Price } from './schemas/Price.schema';
import { Share } from './schemas/Share.schema';

@Injectable()
export class ShareService {
  constructor(
    @InjectModel(Share.name) private shareModel: Model<Share>,
    @InjectModel(Price.name) private priceModel: Model<Price>,
  ) {}

  public async getShare(id: string): Promise<Share | null> {
    if (!id || !isValidObjectId(id)) return null;
    const share = await this.shareModel.findById(id);
    return share || null;
  }

  public async getAvailableShares(): Promise<Share[]> {
    return this.shareModel.find();
  }

  public async getCurrentPrice(id: string): Promise<number> {
    const share = await this.getShare(id);
    if (!share) return -1;
    return share.price;
  }

  public async getPrices(
    id: string,
    from?: number,
    until?: number,
  ): Promise<Price[]> {
    if (!id || !isValidObjectId(id)) return [];

    const filter = [];
    if (from && typeof from === 'number') {
      filter.push({ timestamp: { $gte: from } });
    }
    if (until && typeof 'until' === 'number') {
      filter.push({ timestamp: { $lte: from } });
    }
    if (filter.length !== 0) {
      return this.priceModel.find({ shareId: id, $and: filter });
    }
    return this.priceModel.find({ shareId: id });
  }

  public async updatePrice(shareId: string, price: number): Promise<void> {
    const share = await this.getShare(shareId);
    if (share) {
      await share.updateOne({ $set: { price: price } });
      await this.priceModel.create({
        shareId: shareId,
        price: price,
        timestamp: new Date().getTime(),
      });
    }
  }
}
