import { PricingEntry } from '../models/PricingEntry.model';

export class SetPricingDto {
  type: string;
  entries: PricingEntry[];
}
