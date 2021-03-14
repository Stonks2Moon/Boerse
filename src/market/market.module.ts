import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Share, ShareSchema } from 'src/share/schemas/Share.schema';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Share.name, schema: ShareSchema }]),
  ],
  providers: [MarketService],
  controllers: [MarketController],
})
export class MarketModule {}
