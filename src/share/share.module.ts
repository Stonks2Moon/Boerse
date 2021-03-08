import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MSSocket } from 'src/MSSocket';
import { Price, PriceSchema } from './schemas/Price.schema';
import { Share, ShareSchema } from './schemas/Share.schema';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Share.name, schema: ShareSchema },
      { name: Price.name, schema: PriceSchema },
    ]),
  ],
  providers: [ShareService, MSSocket],
  controllers: [ShareController],
  exports: [ShareService],
})
export class ShareModule {}
