import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrokerController } from './broker.controller';
import { BrokerService } from './broker.service';
import { Broker, BrokerSchema } from './schemas/Broker.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Broker.name, schema: BrokerSchema }]),
  ],
  providers: [BrokerService],
  controllers: [BrokerController],
})
export class BrokerModule {}
