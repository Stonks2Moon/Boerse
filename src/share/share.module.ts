import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Share, ShareSchema } from './schemas/Share.schema';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Share.name, schema: ShareSchema }]),
  ],
  providers: [ShareService],
  controllers: [ShareController],
})
export class ShareModule {}
