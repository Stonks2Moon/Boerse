import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SetPricingDto } from './dtos/SetPricing.dto';
import { PricingFormValidator } from './PricingFormValidator';
import { Pricing } from './schemas/Pricing.schema';

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(Pricing.name) private pricingModel: Model<Pricing>,
  ) {}

  /**
   * Returns all pricings
   * @returns all pricings
   */
  public async getAll(): Promise<Pricing[]> {
    return this.pricingModel.find();
  }

  /**
   * Returns broker types
   * @returns broker types
   */
  public async getTypes(): Promise<string[]> {
    const models = await this.getAll();
    return models.map((x) => x.type);
  }

  /**
   * Returns pricing for broker type
   * @param type broker type
   * @returns pricing list
   */
  public async getPricing(type: string): Promise<Pricing> {
    return this.pricingModel.findOne({ type: type });
  }

  /**
   * Deletes pricing of given type
   * @param type broker type
   */
  public async deletePricing(type: string): Promise<void> {
    await this.pricingModel.deleteOne({ type: type });
  }

  /**
   * Creates new or update existing pricing
   * @param dto SetPricingDto
   * @returns pricing of given type
   */
  public async setPricing(dto: SetPricingDto): Promise<Pricing> {
    dto = PricingFormValidator.validate(dto);
    await this.pricingModel.updateOne(
      { type: dto.type },
      { ...dto },
      { upsert: true },
    );
    return this.getPricing(dto.type);
  }
}
