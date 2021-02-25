import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { IShare } from './interfaces/IShare.interface';
import { Share } from './schemas/Share.schema';

@Injectable()
export class ShareService {
  constructor(@InjectModel(Share.name) private shareModel: Model<Share>) {}

  public async getAvailableShares(): Promise<IShare[]> {
    return this.shareModel.find();
  }

  public async getCurrentPrice(id: string): Promise<number> {
    if (!isValidObjectId(id)) return -1;

    const share = await this.shareModel.findById(id);
    if (!share) return 0;

    return share.price;
  }
}
