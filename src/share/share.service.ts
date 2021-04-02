import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { MSSocket } from 'src/MSSocket';
import { CreateShareDto } from './dtos/CreateShare.dto';
import { Price } from './schemas/Price.schema';
import { Share } from './schemas/Share.schema';
import { ShareValidator } from './ShareValidator';

@Injectable()
export class ShareService {
  constructor(
    @InjectModel(Share.name) private shareModel: Model<Share>,
    @InjectModel(Price.name) private priceModel: Model<Price>,
    private readonly msSocket: MSSocket,
  ) {}

  public async getShare(id: string): Promise<Share | null> {
    if (!id || !isValidObjectId(id)) return null;
    const share = await this.shareModel.findById(id);
    return share || null;
  }

  public async getAvailableShares(): Promise<Share[]> {
    return this.shareModel.find();
  }

  public async getIsTradeable(shareId: string): Promise<boolean> {
    if (!shareId || !isValidObjectId(shareId)) return false;
    const share = await this.shareModel.findOne({ _id: shareId });
    if (!share) return false;
    if (share.tradeDisabled) return false;
    return true;
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
    limit?: number,
  ): Promise<Price[]> {
    if (!id || !isValidObjectId(id)) return [];

    let prices = this.priceModel.find({ shareId: id }).sort({ timestamp: -1 });

    if (from && typeof from === 'number') {
      prices = prices.find({ timestamp: { $gte: from } });
    }
    if (until && typeof until === 'number') {
      prices = prices.find({ timestamp: { $lte: until } });
    }
    if (limit && typeof limit === 'number') {
      prices = prices.limit(limit);
    }

    return prices;
  }

  public async updatePrice(shareId: string, price: number): Promise<void> {
    const share = await this.getShare(shareId);

    if (share) {
      // TODO: Remove or keep?
      if (share.price === price) return;

      await this.shareModel.updateOne(
        { _id: shareId },
        { $set: { price: price } },
      );

      const model = await this.priceModel.create({
        shareId: shareId,
        price: price,
        timestamp: Date.now(),
      });

      this.msSocket.server.emit('price', {
        shareId: shareId,
        ...model.toJSON(),
      });
    }
  }

  public async patchShare(id: string, dto: CreateShareDto): Promise<Share> {
    dto = ShareValidator.validate(dto);
    if (!id || id.length === 0 || !isValidObjectId(id)) {
      throw new UnprocessableEntityException('Invalid shareId');
    }

    await this.shareModel.updateOne({ _id: id }, { $set: dto });
    return this.getShare(id);
  }

  public async createShare(dto: CreateShareDto): Promise<Share> {
    dto = ShareValidator.validate(dto);
    return this.shareModel.create(dto);
  }
}
