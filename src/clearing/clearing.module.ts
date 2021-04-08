import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { ClearingController } from './clearing.controller';
import { ClearingService } from './clearing.service';
import { Clearing, ClearingSchema } from './schemas/Clearing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Clearing.name, schema: ClearingSchema },
    ]),
    InvoiceModule,
  ],
  providers: [ClearingService],
  controllers: [ClearingController],
})
export class ClearingModule {}
