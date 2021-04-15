import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Broker, BrokerSchema } from 'src/broker/schemas/Broker.schema';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { Pricing, PricingSchema } from 'src/pricing/schemas/Pricing.schema';
import { ClearingController } from './clearing.controller';
import { ClearingService } from './clearing.service';
import { Clearing, ClearingSchema } from './schemas/Clearing.schema';
import {
  DailyClearing,
  DailyClearingSchema,
} from './schemas/DailyClearing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Clearing.name, schema: ClearingSchema },
      { name: Broker.name, schema: BrokerSchema },
      { name: Pricing.name, schema: PricingSchema },
      { name: DailyClearing.name, schema: DailyClearingSchema },
    ]),
    InvoiceModule,
  ],
  providers: [ClearingService],
  controllers: [ClearingController],
})
export class ClearingModule {}
