import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { Pricing, PricingSchema } from './schemas/Pricing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pricing.name, schema: PricingSchema }]),
  ],
  providers: [PricingService],
  controllers: [PricingController],
})
export class PricingModule {}
