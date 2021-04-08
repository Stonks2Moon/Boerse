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

  /**
   * Returns share with given Id
   * @param shareId ID of share
   * @returns share or null
   */
  public async getShare(shareId: string): Promise<Share | null> {
    if (!shareId || !isValidObjectId(shareId)) return null;
    const share = await this.shareModel.findById(shareId);
    return share || null;
  }

  /**
   * Returns all available shares
   * @returns all available shares
   */
  public async getAvailableShares(): Promise<Share[]> {
    return this.shareModel.find();
  }

  /**
   * Checks if trade of share is disabled or not
   * @param shareId ID of share
   * @returns false or true
   */
  public async isTradeable(shareId: string): Promise<boolean> {
    if (!shareId || !isValidObjectId(shareId)) return false;
    const share = await this.shareModel.findOne({ _id: shareId });
    if (!share) return false;
    if (share.tradeDisabled) return false;
    return true;
  }

  /**
   * Checks current price of given share
   * @param shareId ID of share
   * @returns current price of share
   */
  public async getCurrentPrice(shareId: string): Promise<number> {
    const share = await this.getShare(shareId);
    if (!share) return -1;
    return share.price;
  }

  /**
   * Returns all prices, limited by given parameters
   * @param shareId ID of share
   * @param from timestamp - start of time span
   * @param until timestamp - end of time span
   * @param limit limits number of results
   * @returns prices
   */
  public async getPrices(
    shareId: string,
    from?: number,
    until?: number,
    limit?: number,
  ): Promise<Price[]> {
    if (!shareId || !isValidObjectId(shareId)) return [];

    let prices = this.priceModel
      .find({ shareId: shareId })
      .sort({ timestamp: -1 });

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

  /**
   * Updates price of a share
   * @param shareId ID of share
   * @param price new price of share
   * @returns void
   */
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

  /**
   * Updates Share with given data
   * @param shareId ID of share
   * @param dto Data you want to update
   * @returns share
   */
  public async patchShare(
    shareId: string,
    dto: CreateShareDto,
  ): Promise<Share> {
    dto = ShareValidator.validate(dto);
    if (!shareId || shareId.length === 0 || !isValidObjectId(shareId)) {
      throw new UnprocessableEntityException('Invalid shareId');
    }

    await this.shareModel.updateOne({ _id: shareId }, { $set: dto });
    return this.getShare(shareId);
  }

  /**
   * Creates a new share
   * @param dto Data of share you want to create
   * @returns share
   */
  public async createShare(dto: CreateShareDto): Promise<Share> {
    dto = ShareValidator.validate(dto);
    return this.shareModel.create(dto);
  }
}
